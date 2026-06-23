'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from 'lightweight-charts';
import { fetchOHLCV } from '@/lib/birdeye';

interface TokenChartProps {
  address: string;
}

type Timeframe = '1H' | '6H' | '24H' | '7D';

const TIMEFRAME_CONFIG: Record<Timeframe, { type: string; seconds: number }> = {
  '1H': { type: '1m', seconds: 3600 },
  '6H': { type: '5m', seconds: 21600 },
  '24H': { type: '15m', seconds: 86400 },
  '7D': { type: '1h', seconds: 604800 },
};

const TIMEFRAMES: Timeframe[] = ['1H', '6H', '24H', '7D'];

export default function TokenChart({ address }: TokenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch OHLCV data and update chart
  const loadChart = useCallback(async (tf: Timeframe) => {
    const config = TIMEFRAME_CONFIG[tf];
    const now = Math.floor(Date.now() / 1000);
    setLoading(true);
    setError(null);

    try {
      const items = await fetchOHLCV(address, config.type, now - config.seconds, now);

      if (!items || items.length === 0) {
        setError('No chart data available');
        return;
      }

      const candles: CandlestickData<Time>[] = items.map((item: any) => ({
        time: item.unixTime as Time,
        open: parseFloat(item.o ?? item.open ?? 0),
        high: parseFloat(item.h ?? item.high ?? 0),
        low: parseFloat(item.l ?? item.low ?? 0),
        close: parseFloat(item.c ?? item.close ?? 0),
      })).sort((a, b) => (a.time as number) - (b.time as number));

      // Volume histogram: green for up-candles, red for down.
      const volume: HistogramData<Time>[] = candles.map((c) => ({
        time: c.time,
        value: 0, // filled below
        color: c.close >= c.open ? 'rgba(0, 200, 83, 0.35)' : 'rgba(255, 23, 68, 0.35)',
      }));

      // Map Birdeye volume field (`v`) onto each candle by time.
      const volByTime = new Map<number, number>();
      items.forEach((item: any) => {
        const t = item.unixTime as number;
        volByTime.set(t, parseFloat(item.v ?? item.volume ?? 0));
      });
      volume.forEach((v) => {
        v.value = volByTime.get(v.time as number) ?? 0;
      });

      if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

      candleSeriesRef.current.setData(candles);
      volumeSeriesRef.current.setData(volume);

      // 24H High / Low dashed price lines
      const high24h = Math.max(...candles.map(c => c.high));
      const low24h = Math.min(...candles.map(c => c.low));
      try {
        candleSeriesRef.current.createPriceLine({
          price: high24h,
          color: 'rgba(0, 200, 83, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '24H High',
        });
        candleSeriesRef.current.createPriceLine({
          price: low24h,
          color: 'rgba(255, 23, 68, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: '24H Low',
        });
      } catch {}

      // Fit the chart to show all data
      chartRef.current.timeScale().fitContent();
    } catch (err) {
      console.error('Chart load error:', err);
      setError('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Initialize chart on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090F' },
        textColor: '#A0A0A0',
        fontFamily: "'Space Mono', monospace",
      },
      grid: {
        vertLines: { color: '#1F1F1F' },
        horzLines: { color: '#1F1F1F' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#39FF14',
          width: 1,
          style: 2, // dashed
          labelBackgroundColor: '#111111',
        },
        horzLine: {
          color: '#39FF14',
          width: 1,
          style: 2,
          labelBackgroundColor: '#111111',
        },
      },
      rightPriceScale: {
        borderColor: '#1F1F1F',
        textColor: '#A0A0A0',
        scaleMargins: { top: 0.08, bottom: 0.28 }, // leave room for volume pane
      },
      timeScale: {
        borderColor: '#1F1F1F',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    // Candlesticks — main pane (pane index 0)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00C853',
      downColor: '#FF1744',
      borderUpColor: '#00C853',
      borderDownColor: '#FF1744',
      wickUpColor: '#00C853',
      wickDownColor: '#FF1744',
    });
    candleSeriesRef.current = candleSeries;

    // Volume histogram — separate bottom pane (pane index 1)
    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // own overlay scale in the pane
      },
      1,
    );
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Load data when chart is ready or timeframe/address changes
  useEffect(() => {
    if (chartRef.current && candleSeriesRef.current && volumeSeriesRef.current) {
      loadChart(timeframe);
    }
  }, [timeframe, address, loadChart]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadChart(timeframe);
    }, 30_000);
    return () => clearInterval(interval);
  }, [timeframe, loadChart]);

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
  };

  const handleRetry = () => {
    loadChart(timeframe);
  };

  return (
    <div className="flex flex-col gap-3 bg-[#12121B] rounded-xl border border-[rgba(255,255,255,.05)] p-4 h-full">
      {/* Chart header — timeframes + overlays + indicators */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all duration-200 ${
                  timeframe === tf
                    ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          {loading && (
            <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          )}
        </div>
        {/* Overlay toggles */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input type="checkbox" className="accent-[#39FF14] w-3 h-3 rounded" />
            My swaps
          </label>
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input type="checkbox" className="accent-[#39FF14] w-3 h-3 rounded" />
            Thesis
          </label>
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input type="checkbox" className="accent-[#39FF14] w-3 h-3 rounded" />
            Friends only
          </label>
          <span className="ml-auto text-[#6B7280]">Indicators ▾</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px]">
        {loading && !chartRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090F] rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
              <span className="text-[#A0A0A0] text-sm font-mono">Loading chart...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090F] rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[#FF1744] text-sm font-mono">{error}</span>
              <button
                onClick={handleRetry}
                className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={containerRef} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
