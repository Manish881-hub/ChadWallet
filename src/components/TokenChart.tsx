'use client';

import { useEffect, useRef, useState } from 'react';

interface TokenChartProps {
  address: string;
}

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

const TIMEFRAME_TO_INTERVAL: Record<Timeframe, string> = {
  '1D': '15',
  '1W': '60',
  '1M': '240',
  '3M': 'D',
  '1Y': 'W',
};

const TIMEFRAME_TO_RANGE: Record<Timeframe, string> = {
  '1D': '1D',
  '1W': '5D',
  '1M': '1M',
  '3M': '3M',
  '1Y': '12M',
};

export default function TokenChart({ address }: TokenChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMySwaps, setShowMySwaps] = useState(false);
  const [showThesis, setShowThesis] = useState(false);
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [autoScale, setAutoScale] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    const container = containerRef.current;
    container.innerHTML = '';
    setLoading(true);
    setError(false);

    const interval = TIMEFRAME_TO_INTERVAL[timeframe];
    const range = TIMEFRAME_TO_RANGE[timeframe];

    // Build TradingView widget URL
    // Using the embedded chart widget
    const widgetOptions = {
      autosize: true,
      symbol: `RAYDIUM:${address}`,
      interval: interval,
      range: range,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1', // candlestick
      locale: 'en',
      backgroundColor: 'rgba(9, 9, 15, 1)',
      gridColor: 'rgba(31, 31, 31, 0.6)',
      hide_top_toolbar: true,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      enable_publishing: false,
      withdateranges: false,
      support_host: 'https://www.tradingview.com',
    };

    // Create TradingView widget via script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (!(window as any).TradingView) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        new (window as any).TradingView.widget({
          ...widgetOptions,
          container_id: container.id,
        });

        // TradingView widget doesn't have a clean onReady callback,
        // so we wait a bit for the iframe to render
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError(true);
      setLoading(false);
    };

    // Fallback: Use an iframe embed directly if script fails
    // This is more reliable for Solana tokens
    const iframe = document.createElement('iframe');
    const params = new URLSearchParams({
      symbol: `RAYDIUM:${address}`,
      interval: interval,
      range: range,
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(9, 9, 15, 1)',
      gridColor: 'rgba(31, 31, 31, 0.6)',
      hide_top_toolbar: 'true',
      hide_legend: 'false',
      hide_side_toolbar: 'true',
      allow_symbol_change: 'false',
      save_image: 'false',
      autosize: 'true',
    });

    iframe.src = `https://s.tradingview.com/widgetembed/?hideideas=1&overrides={"mainSeriesProperties.candleStyle.upColor":"#00C853","mainSeriesProperties.candleStyle.downColor":"#FF1744","mainSeriesProperties.candleStyle.borderUpColor":"#00C853","mainSeriesProperties.candleStyle.borderDownColor":"#FF1744","mainSeriesProperties.candleStyle.wickUpColor":"#00C853","mainSeriesProperties.candleStyle.wickDownColor":"#FF1744","paneProperties.background":"#09090F","paneProperties.backgroundType":"solid"}&${params.toString()}`;
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    iframe.title = 'TradingView Chart';
    iframe.allow = 'autoplay';
    iframe.loading = 'lazy';
    iframe.id = `tv-chart-${address}`;

    iframe.onload = () => {
      setLoading(false);
    };
    iframe.onerror = () => {
      setError(true);
      setLoading(false);
    };

    container.appendChild(iframe);

    return () => {
      container.innerHTML = '';
    };
  }, [address, timeframe]);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    // Force re-render by toggling timeframe
    const current = timeframe;
    setTimeframe('1D');
    setTimeout(() => setTimeframe(current), 50);
  };

  return (
    <div className="flex flex-col bg-[#09090F] rounded-xl border border-[rgba(255,255,255,.05)] overflow-hidden h-full">
      {/* Chart container — fills available space */}
      <div className="relative flex-1 min-h-0 min-w-0">
        {/* Loading skeleton */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#09090F]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
              <span className="text-[#A0A0A0] text-xs font-mono">Loading chart…</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#09090F]">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[#FF1744] text-sm font-mono">Chart unavailable</span>
              <button
                onClick={handleRetry}
                className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20 transition-colors press-scale"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          id={`tv-container-${address}`}
          className="w-full h-full"
        />
      </div>

      {/* Chart controls bar */}
      <div className="flex flex-col gap-2 px-3 py-2 border-t border-[rgba(255,255,255,.05)]">
        {/* Timeframe buttons + timestamp + scale toggles */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md transition-all duration-200 press-scale ${
                timeframe === tf
                  ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                  : 'text-[#6B7280] hover:text-[#A0A0A0] hover:bg-white/5 border border-transparent'
              }`}
            >
              {tf}
            </button>
          ))}

          <span className="text-[9px] font-mono text-[#555] ml-1 tabular-nums">
            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setLogScale(!logScale)}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded transition-colors ${
                logScale ? 'text-[#39FF14] bg-[#39FF14]/10' : 'text-[#555] hover:text-[#A0A0A0]'
              }`}
            >
              log
            </button>
            <button
              onClick={() => setAutoScale(!autoScale)}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded transition-colors ${
                autoScale ? 'text-[#39FF14] bg-[#39FF14]/10' : 'text-[#555] hover:text-[#A0A0A0]'
              }`}
            >
              auto
            </button>
          </div>
        </div>

        {/* Overlay checkboxes */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="text-[#A0A0A0] font-bold">Chart overlays</span>
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showMySwaps}
              onChange={() => setShowMySwaps(!showMySwaps)}
              className="accent-[#39FF14] w-3 h-3 rounded"
            />
            My swaps
          </label>
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showThesis}
              onChange={() => setShowThesis(!showThesis)}
              className="accent-[#39FF14] w-3 h-3 rounded"
            />
            Thesis
          </label>
          <label className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#A0A0A0] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showFriendsOnly}
              onChange={() => setShowFriendsOnly(!showFriendsOnly)}
              className="accent-[#39FF14] w-3 h-3 rounded"
            />
            Friends only
          </label>
        </div>
      </div>
    </div>
  );
}
