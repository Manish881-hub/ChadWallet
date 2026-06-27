'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchOHLCV } from '@/lib/birdeye';

interface TokenChartProps {
  address: string;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

const TIMEFRAME_CONFIG: Record<Timeframe, { type: string; seconds: number }> = {
  '1D': { type: '15m', seconds: 24 * 60 * 60 },
  '1W': { type: '1H', seconds: 7 * 24 * 60 * 60 },
  '1M': { type: '4H', seconds: 30 * 24 * 60 * 60 },
  '3M': { type: '1D', seconds: 90 * 24 * 60 * 60 },
  '1Y': { type: '1W', seconds: 365 * 24 * 60 * 60 },
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function readCandle(item: Record<string, unknown>): Candle | null {
  const open = toNumber(item.o ?? item.open);
  const high = toNumber(item.h ?? item.high);
  const low = toNumber(item.l ?? item.low);
  const close = toNumber(item.c ?? item.close);
  const time = toNumber(item.unixTime ?? item.time ?? item.t);

  if (open <= 0 || high <= 0 || low <= 0 || close <= 0) return null;
  return { time, open, high, low, close };
}

function buildLinePath(candles: Candle[], width: number, height: number): string {
  if (candles.length === 0) return '';

  const paddingX = 14;
  const paddingY = 16;
  const prices = candles.flatMap(candle => [candle.high, candle.low]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = max - min || max || 1;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  return candles
    .map((candle, index) => {
      const x = paddingX + (candles.length === 1 ? chartWidth : (index / (candles.length - 1)) * chartWidth);
      const y = paddingY + ((max - candle.close) / spread) * chartHeight;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function buildAreaPath(linePath: string, width: number, height: number): string {
  if (!linePath) return '';
  const first = linePath.match(/^M([0-9.]+),/);
  const last = linePath.match(/L?([0-9.]+),[0-9.]+$/);
  if (!first || !last) return '';
  return `${linePath} L${last[1]},${height - 16} L${first[1]},${height - 16} Z`;
}

export default function TokenChart({ address }: TokenChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    const config = TIMEFRAME_CONFIG[timeframe];
    const now = Math.floor(Date.now() / 1000);

    async function loadChart() {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchOHLCV(address, config.type, now - config.seconds, now);
        if (cancelled) return;

        const nextCandles = items
          .map(readCandle)
          .filter((candle): candle is Candle => Boolean(candle))
          .sort((a, b) => a.time - b.time);

        setCandles(nextCandles);
        setLoadedAt(new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
        }));
        setError(nextCandles.length === 0 ? 'No chart data returned for this token.' : null);
      } catch {
        if (!cancelled) {
          setCandles([]);
          setError('Chart data unavailable.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChart();
    return () => { cancelled = true; };
  }, [address, timeframe]);

  const { linePath, areaPath, positive, minLabel, maxLabel, latestLabel } = useMemo(() => {
    const width = 1000;
    const height = 260;
    const line = buildLinePath(candles, width, height);
    const prices = candles.flatMap(candle => [candle.high, candle.low]);
    const first = candles[0]?.open ?? 0;
    const last = candles[candles.length - 1]?.close ?? 0;

    return {
      linePath: line,
      areaPath: buildAreaPath(line, width, height),
      positive: last >= first,
      minLabel: prices.length ? `$${Math.min(...prices).toPrecision(5)}` : '$--',
      maxLabel: prices.length ? `$${Math.max(...prices).toPrecision(5)}` : '$--',
      latestLabel: last > 0 ? `$${last.toPrecision(6)}` : '$--',
    };
  }, [candles]);

  return (
    <div className="flex flex-col bg-[#09090F] rounded-xl border border-[rgba(255,255,255,.05)] overflow-hidden h-full">
      <div className="relative flex-1 min-h-[220px] min-w-0 bg-[#09090F]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 260"
          preserveAspectRatio="none"
          role="img"
          aria-label="Token price chart"
        >
          <defs>
            <linearGradient id="token-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? '#00C853' : '#FF1744'} stopOpacity="0.32" />
              <stop offset="100%" stopColor={positive ? '#00C853' : '#FF1744'} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map(line => (
            <line
              key={line}
              x1="14"
              x2="986"
              y1={24 + line * 58}
              y2={24 + line * 58}
              stroke="rgba(255,255,255,.06)"
              strokeWidth="1"
            />
          ))}
          {areaPath && <path d={areaPath} fill="url(#token-chart-fill)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={positive ? '#00C853' : '#FF1744'}
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        <div className="absolute left-4 top-3 flex items-center gap-3">
          <span className="text-xs font-mono text-[#A0A0A0]">Latest</span>
          <span className="text-sm font-mono font-bold text-white tabular-nums">{latestLabel}</span>
        </div>

        <div className="absolute right-4 top-3 flex flex-col items-end gap-1 text-[10px] font-mono text-[#6B7280] tabular-nums">
          <span>{maxLabel}</span>
          <span>{minLabel}</span>
        </div>

        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#09090F]/90">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
              <span className="text-[#A0A0A0] text-xs font-mono">Loading chart...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#09090F]">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[#FF1744] text-sm font-mono">{error}</span>
              <button
                onClick={() => setTimeframe(current => (current === '1D' ? '1W' : '1D'))}
                className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20 transition-colors press-scale"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 px-3 py-2 border-t border-[rgba(255,255,255,.05)]">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`touch-target px-2.5 py-1 text-[10px] font-mono font-bold rounded-md transition-all duration-200 press-scale ${
                timeframe === tf
                  ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                  : 'text-[#9CA3AF] hover:text-[#A0A0A0] hover:bg-white/5 border border-transparent'
              }`}
            >
              {tf}
            </button>
          ))}

          <span className="text-[9px] font-mono text-[#888] ml-1 tabular-nums">
            {loadedAt || '--:--:--'} UTC
          </span>
        </div>
      </div>
    </div>
  );
}
