// Birdeye API helpers — with in-memory cache + retry + global throttling
import axios, { type AxiosInstance } from 'axios';
import { logger } from './logger';
import { NetworkError } from './errors';

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

// ── Serial request queue ────────────────────────────────────────────
// Birdeye free tier: ~10 req/min. We enforce a minimum gap between
// requests via a serial promise chain — no race conditions possible.
const MIN_GAP_MS = 7_500; // ~8 req/min
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

// ── In-memory cache with stale-while-revalidate ────────────────────
const cache = new Map<string, { data: any; ts: number }>();
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

function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Dedup + retry fetcher ──────────────────────────────────────────
const inFlight = new Map<string, Promise<any>>();

async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const execute = async (attempt: number): Promise<T> => {
    try {
      const result = await throttle(fetcher);
      setCache(key, result);
      return result;
    } catch (err: any) {
      if (err?.response?.status === 429) {
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
      if (err?.code === 'ECONNABORTED') {
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

// ── Normalize ──────────────────────────────────────────────────────
function normalizeToken(raw: any): any {
  const resolveChange = (vals: any[]) => vals.find(v => typeof v === 'number' && !Number.isNaN(v)) ?? 0;
  return {
    address: raw.address ?? '',
    symbol: raw.symbol ?? '???',
    name: raw.name ?? '',
    logo_uri: raw.logoURI ?? raw.logo_uri ?? raw.icon ?? '',
    price: raw.price ?? raw.v24hUSD ?? 0,
    price_change_24h_percent: resolveChange([
      raw.priceChange24hPercent, raw.price_change_24h_percent, raw.v24hChangePercent,
    ]),
    price_change_1h_percent: resolveChange([raw.priceChange1hPercent, raw.price_change_1h_percent]),
    price_change_2h_percent: resolveChange([raw.priceChange2hPercent, raw.price_change_2h_percent]),
    price_change_4h_percent: resolveChange([raw.priceChange4hPercent, raw.price_change_4h_percent]),
    price_change_6h_percent: resolveChange([raw.priceChange6hPercent, raw.price_change_6h_percent]),
    price_change_8h_percent: resolveChange([raw.priceChange8hPercent, raw.price_change_8h_percent]),
    price_change_12h_percent: resolveChange([raw.priceChange12hPercent, raw.price_change_12h_percent]),
    price_change_5m_percent: resolveChange([raw.priceChange5mPercent, raw.price_change_5m_percent]),
    market_cap: raw.mc ?? raw.market_cap ?? raw.marketCap ?? 0,
    real_fdv: raw.realFd ?? raw.real_fdv ?? raw.realFdv ?? raw.fdv ?? 0,
    volume_24h: raw.v24hUSD ?? raw.volume24h ?? 0,
    liquidity: raw.liquidity ?? raw.liquidityUSD ?? raw.real_liquidity ?? 0,
    holder: raw.holder ?? raw.holders ?? 0,
  };
}

// ── API Functions ──────────────────────────────────────────────────

export async function fetchTrendingTokens(): Promise<any[]> {
  return dedupedFetch('trending', async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_trending', {
        params: { sort_by: 'rank', sort_type: 'asc', offset: 0, limit: 20 },
      });
      const items = data?.data?.tokens ?? data?.data?.items ?? data?.data ?? [];
      return Array.isArray(items) ? items.map(normalizeToken) : [];
    } catch (err: any) {
      if (err?.response?.status === 429) throw err;
      logger.error('fetchTrendingTokens failed', { error: err?.message });
      return getCached<any[]>('trending') ?? [];
    }
  });
}

export async function fetchTokenOverview(address: string): Promise<any | null> {
  return dedupedFetch(`overview:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_overview', {
        params: { address },
      });
      return data?.data ? normalizeToken(data.data) : null;
    } catch (err: any) {
      // Let 429s bubble up to dedupedFetch for retry with backoff
      if (err?.response?.status === 429) throw err;
      logger.error('fetchTokenOverview failed', { address, error: err?.message });
      return getCached<any>(`overview:${address}`) ?? null;
    }
  });
}

export async function fetchOHLCV(
  address: string, type: string = '15m', timeFrom?: number, timeTo?: number,
): Promise<any[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = timeFrom ?? now - 86400;
  const to = timeTo ?? now;
  return dedupedFetch(`ohlcv:${address}:${type}:${from}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/ohlcv', {
        params: { address, type, time_from: from, time_to: to },
      });
      return data?.data?.items ?? [];
    } catch (err: any) {
      if (err?.response?.status === 429) throw err;
      if (err?.code === 'ECONNABORTED') {
        logger.warn('fetchOHLCV timeout', { address, type });
        return [];
      }
      logger.error('fetchOHLCV failed', { address, type, error: err?.message });
      return [];
    }
  });
}

export async function fetchTokenTrades(address: string, limit = 50): Promise<any[]> {
  return dedupedFetch(`trades:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/txs/token', {
        params: { address, offset: 0, limit, sort_type: 'desc' },
      });
      return data?.data?.items ?? [];
    } catch (err: any) {
      if (err?.response?.status === 429) throw err;
      // Timeouts are expected for some tokens (e.g. native SOL) — warn instead of error
      if (err?.code === 'ECONNABORTED') {
        logger.warn('fetchTokenTrades timeout', { address });
        return [];
      }
      logger.error('fetchTokenTrades failed', { address, error: err?.message });
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
      const items: any[] = data?.data?.items ?? [];
      if (items.length === 0) return [];
      const closes = items.map((it: any) => parseFloat(it.c ?? it.close ?? 0));
      const sliced = closes.length > points ? closes.slice(-points) : closes;
      return sliced.filter(v => v > 0);
    } catch (err: any) {
      if (err?.response?.status === 429) throw err;
      logger.warn('fetchSparkline failed', { address, error: err?.message });
      return [];
    }
  });
}
