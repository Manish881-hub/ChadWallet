// Birdeye API helpers — with in-memory cache to avoid 429 rate limits
import axios from 'axios';

const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY!;
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

const birdeyeClient = axios.create({
  baseURL: BIRDEYE_BASE_URL,
  headers: {
    'X-API-KEY': BIRDEYE_API_KEY,
    'x-chain': 'solana',
  },
});

// ── Simple in-memory cache ─────────────────────────────────────────
// Prevents duplicate requests when multiple components mount simultaneously
const cache = new Map<string, { data: any; ts: number; promise?: Promise<any> }>();
const CACHE_TTL = 60_000; // 60 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
}

// Dedup in-flight requests: if a fetch for the same key is already running, reuse it
const inFlight = new Map<string, Promise<any>>();

async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Return from cache if fresh
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  // If a request for this key is already in-flight, piggyback on it
  if (inFlight.has(key)) return inFlight.get(key) as Promise<T>;

  const promise = fetcher().then((result) => {
    setCache(key, result);
    inFlight.delete(key);
    return result;
  }).catch((err) => {
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
    // Birdeye exposes several percent-change keys depending on endpoint/version.
    price_change_24h_percent: resolveChange([
      raw.priceChange24hPercent,
      raw.price_change_24h_percent,
      raw.v24hChangePercent,
    ]),
    // Higher-resolution change windows for the stats strip
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

/**
 * Fetch trending / top tokens from Birdeye (cached 60s, deduped)
 */
export async function fetchTrendingTokens(): Promise<any[]> {
  return dedupedFetch('trending', async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_trending', {
        params: { sort_by: 'rank', sort_type: 'asc', offset: 0, limit: 20 },
      });
      const items = data?.data?.tokens ?? data?.data?.items ?? data?.data ?? [];
      return Array.isArray(items) ? items.map(normalizeToken) : [];
    } catch (err: any) {
      if (err?.response?.status === 429) {
        console.warn('Birdeye rate limited (429) on trending — returning cached or empty');
        return getCached<any[]>('trending') ?? [];
      }
      console.error('fetchTrendingTokens error:', err);
      return [];
    }
  });
}

/**
 * Fetch detailed overview for a single token by its mint address (cached 60s, deduped)
 */
export async function fetchTokenOverview(address: string): Promise<any | null> {
  return dedupedFetch(`overview:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/token_overview', {
        params: { address },
      });
      const raw = data?.data ?? null;
      return raw ? normalizeToken(raw) : null;
    } catch (err: any) {
      if (err?.response?.status === 429) {
        console.warn('Birdeye rate limited (429) on overview — returning cached or null');
        return getCached<any>(`overview:${address}`) ?? null;
      }
      console.error('fetchTokenOverview error:', err);
      return null;
    }
  });
}

/**
 * Fetch OHLCV candle data for TokenChart (cached 60s, deduped)
 */
export async function fetchOHLCV(
  address: string,
  type: string = '15m',
  timeFrom?: number,
  timeTo?: number,
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
      if (err?.response?.status === 429) {
        console.warn('Birdeye rate limited (429) on OHLCV');
      } else {
        console.error('fetchOHLCV error:', err);
      }
      return [];
    }
  });
}

/**
 * Fetch recent trades for a token (cached 30s, deduped)
 */
export async function fetchTokenTrades(address: string, limit = 50): Promise<any[]> {
  return dedupedFetch(`trades:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/txs/token', {
        params: { address, offset: 0, limit, sort_type: 'desc' },
      });
      return data?.data?.items ?? [];
    } catch (err: any) {
      if (err?.response?.status === 429) {
        console.warn('Birdeye rate limited (429) on trades');
      } else {
        console.error('fetchTokenTrades error:', err);
      }
      return [];
    }
  });
}

/**
 * Fetch a short price history for a token's mini sparkline (cached 60s, deduped).
 * Returns ~20 closing prices. Never throws — returns [] on rate-limit/error so the
 * trending list can render instantly without waiting on sparklines.
 */
export async function fetchSparkline(address: string, points = 20): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 6 * 3600; // last 6h is enough resolution for a 20pt sparkline
  return dedupedFetch(`spark:${address}`, async () => {
    try {
      const { data } = await birdeyeClient.get('/defi/ohlcv', {
        params: { address, type: '15m', time_from: from, time_to: now },
      });
      const items: any[] = data?.data?.items ?? [];
      if (items.length === 0) return [];
      const closes = items.map((it: any) => parseFloat(it.c ?? it.close ?? 0));
      const sliced = closes.length > points ? closes.slice(closes.length - points) : closes;
      return sliced.filter(v => v > 0);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        console.warn('Birdeye rate limited (429) on sparkline');
      } else {
        console.error('fetchSparkline error:', err);
      }
      return [];
    }
  });
}
