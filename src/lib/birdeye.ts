import axios, { type AxiosInstance } from 'axios';
import { logger } from './logger';

const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!;
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';
const REQUEST_TIMEOUT = 15_000;
const MAX_RETRIES = 3;
const RETRY_429_DELAY = 5_000;

const birdeyeClient: AxiosInstance = axios.create({
  baseURL: BIRDEYE_BASE_URL,
  headers: { 'X-API-KEY': BIRDEYE_API_KEY, 'x-chain': 'solana' },
  timeout: REQUEST_TIMEOUT,
});

type JsonRecord = Record<string, unknown>;

export type BirdeyeToken = {
  address: string;
  symbol: string;
  name: string;
  logo_uri: string;
  price: number;
  price_change_24h_percent: number;
  price_change_1h_percent: number;
  price_change_2h_percent: number;
  price_change_4h_percent: number;
  price_change_6h_percent: number;
  price_change_8h_percent: number;
  price_change_12h_percent: number;
  price_change_5m_percent: number;
  market_cap: number;
  real_fdv: number;
  volume_24h: number;
  liquidity: number;
  holder: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

function getErrorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error.code === 'string' ? error.code : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const MIN_GAP_MS = 7_500;
let lastRequestTime = 0;
let queue: Promise<void> = Promise.resolve();

async function throttle<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue = queue.then(async () => {
      const now = Date.now();
      const elapsed = now - lastRequestTime;
      if (elapsed < MIN_GAP_MS) {
        await new Promise(r => setTimeout(r, MIN_GAP_MS - elapsed));
      }
      lastRequestTime = Date.now();
      try {
        resolve(await fn());
      } catch (err) {
        reject(err);
      }
    });
  });
}

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 120_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function getStaleCached<T>(key: string): T | null {
  const entry = cache.get(key);
  return entry ? (entry.data as T) : null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

const inFlight = new Map<string, Promise<unknown>>();

async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const execute = async (attempt: number): Promise<T> => {
    try {
      const result = await throttle(fetcher);
      setCache(key, result);
      return result;
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) {
        logger.warn('Birdeye rate limited', { key, attempt });
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_429_DELAY * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
          return execute(attempt + 1);
        }
        const stale = getStaleCached<T>(key);
        if (stale) return stale;
        return (key.startsWith('overview:') ? null : []) as T;
      }
      if (getErrorCode(err) === 'ECONNABORTED') {
        logger.warn('Birdeye timeout', { key, attempt });
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000));
          return execute(attempt + 1);
        }
      }
      throw err;
    }
  };

  const promise = execute(0)
    .then((result) => {
      inFlight.delete(key);
      return result;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

function normalizeToken(raw: JsonRecord): BirdeyeToken {
  const resolveChange = (vals: unknown[]) => vals.map(asNumber).find(v => v !== undefined) ?? 0;

  return {
    address: asString(raw.address),
    symbol: asString(raw.symbol, '???'),
    name: asString(raw.name),
    logo_uri: asString(raw.logoURI ?? raw.logo_uri ?? raw.icon),
    price: asNumber(raw.price) ?? asNumber(raw.v24hUSD) ?? 0,
    price_change_24h_percent: resolveChange([
      raw.price24hChangePercent,
      raw.priceChange24hPercent,
      raw.price_change_24h_percent,
      raw.v24hChangePercent,
    ]),
    price_change_1h_percent: resolveChange([raw.priceChange1hPercent, raw.price_change_1h_percent]),
    price_change_2h_percent: resolveChange([raw.priceChange2hPercent, raw.price_change_2h_percent]),
    price_change_4h_percent: resolveChange([raw.priceChange4hPercent, raw.price_change_4h_percent]),
    price_change_6h_percent: resolveChange([raw.priceChange6hPercent, raw.price_change_6h_percent]),
    price_change_8h_percent: resolveChange([raw.priceChange8hPercent, raw.price_change_8h_percent]),
    price_change_12h_percent: resolveChange([raw.priceChange12hPercent, raw.price_change_12h_percent]),
    price_change_5m_percent: resolveChange([raw.priceChange5mPercent, raw.price_change_5m_percent]),
    market_cap: asNumber(raw.mc) ?? asNumber(raw.market_cap) ?? asNumber(raw.marketCap) ?? 0,
    real_fdv: asNumber(raw.realFd) ?? asNumber(raw.real_fdv) ?? asNumber(raw.realFdv) ?? asNumber(raw.fdv) ?? 0,
    volume_24h: asNumber(raw.v24hUSD) ?? asNumber(raw.volume24h) ?? 0,
    liquidity: asNumber(raw.liquidity) ?? asNumber(raw.liquidityUSD) ?? asNumber(raw.real_liquidity) ?? 0,
    holder: asNumber(raw.holder) ?? asNumber(raw.holders) ?? 0,
  };
}

function extractItems(data: unknown): JsonRecord[] {
  if (!isRecord(data)) return [];

  const inner = data.data;
  const items = Array.isArray(inner)
    ? inner
    : isRecord(inner)
      ? inner.tokens ?? inner.items ?? inner.data
      : [];

  return Array.isArray(items) ? items.filter(isRecord) : [];
}

export async function fetchTrendingTokens(): Promise<BirdeyeToken[]> {
  return dedupedFetch('trending', async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_trending', {
        params: { sort_by: 'rank', sort_type: 'asc', offset: 0, limit: 20 },
      });
      return extractItems(data).map(normalizeToken);
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) throw err;
      logger.error('fetchTrendingTokens failed', { error: getErrorMessage(err) });
      return getCached<BirdeyeToken[]>('trending') ?? [];
    }
  });
}

export async function fetchTokenOverview(address: string): Promise<BirdeyeToken | null> {
  return dedupedFetch(`overview:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_overview', {
        params: { address },
      });
      const body = isRecord(data) && isRecord(data.data) ? data.data : null;
      return body ? normalizeToken(body) : null;
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) throw err;
      logger.error('fetchTokenOverview failed', { address, error: getErrorMessage(err) });
      return getCached<BirdeyeToken>(`overview:${address}`) ?? null;
    }
  });
}

export async function fetchOHLCV(
  address: string,
  type: string = '15m',
  timeFrom?: number,
  timeTo?: number,
): Promise<JsonRecord[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = timeFrom ?? now - 86400;
  const to = timeTo ?? now;

  return dedupedFetch(`ohlcv:${address}:${type}:${from}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/ohlcv', {
        params: { address, type, time_from: from, time_to: to },
      });
      const body = isRecord(data) && isRecord(data.data) ? data.data : {};
      return Array.isArray(body.items) ? body.items.filter(isRecord) : [];
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) throw err;
      if (getErrorCode(err) === 'ECONNABORTED') {
        logger.warn('fetchOHLCV timeout', { address, type });
        return [];
      }
      logger.error('fetchOHLCV failed', { address, type, error: getErrorMessage(err) });
      return [];
    }
  });
}

export async function fetchTokenTrades(address: string, limit = 50): Promise<JsonRecord[]> {
  return dedupedFetch(`trades:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/txs/token', {
        params: { address, offset: 0, limit, sort_type: 'desc' },
      });
      const body = isRecord(data) && isRecord(data.data) ? data.data : {};
      return Array.isArray(body.items) ? body.items.filter(isRecord) : [];
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) throw err;
      if (getErrorCode(err) === 'ECONNABORTED') {
        logger.warn('fetchTokenTrades timeout', { address });
        return [];
      }
      logger.error('fetchTokenTrades failed', { address, error: getErrorMessage(err) });
      return [];
    }
  });
}

export async function fetchSparkline(address: string, points = 20): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 6 * 3600;

  return dedupedFetch(`spark:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/ohlcv', {
        params: { address, type: '15m', time_from: from, time_to: now },
      });
      const body = isRecord(data) && isRecord(data.data) ? data.data : {};
      const items = Array.isArray(body.items) ? body.items.filter(isRecord) : [];
      if (items.length === 0) return [];
      const closes = items.map(item => asNumber(item.c) ?? asNumber(item.close) ?? 0);
      const sliced = closes.length > points ? closes.slice(-points) : closes;
      return sliced.filter(v => v > 0);
    } catch (err: unknown) {
      if (getErrorStatus(err) === 429) throw err;
      logger.warn('fetchSparkline failed', { address, error: getErrorMessage(err) });
      return [];
    }
  });
}
