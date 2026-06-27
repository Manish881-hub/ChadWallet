'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { fetchOHLCV } from '@/lib/birdeye';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TokenChartProps {
  address: string;
  tokenSymbol?: string;
  tokenName?: string;
}

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Interval = '1m' | '5m' | '15m' | '1H' | '4H' | '1D';
type Period = '1D' | '1W' | '1M' | '3M' | '1Y';

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

const INTERVALS: Interval[] = ['1m', '5m', '15m', '1H', '4H', '1D'];

const PERIOD_CONFIG: Record<Period, { interval: Interval; seconds: number }> = {
  '1D': { interval: '15m', seconds: 24 * 3600 },
  '1W': { interval: '1H', seconds: 7 * 24 * 3600 },
  '1M': { interval: '4H', seconds: 30 * 24 * 3600 },
  '3M': { interval: '1D', seconds: 90 * 24 * 3600 },
  '1Y': { interval: '1D', seconds: 365 * 24 * 3600 },
};

const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y'];

/* Colors */
const COLOR_BG = '#0A0A0F';
const COLOR_BULL = '#26A69A';
const COLOR_BEAR = '#EF5350';
const COLOR_BULL_VOL = 'rgba(38,166,154,0.35)';
const COLOR_BEAR_VOL = 'rgba(239,83,80,0.35)';
const COLOR_GRID = 'rgba(255,255,255,0.04)';
const COLOR_AXIS_TEXT = '#6B7280';
const COLOR_CROSSHAIR = 'rgba(150,150,150,0.5)';
const COLOR_PRICE_LINE = 'rgba(57,255,20,0.5)';
const COLOR_PRICE_BADGE_BG = '#39FF14';
const COLOR_PRICE_BADGE_TEXT = '#000';

/* Layout */
const AXIS_RIGHT_WIDTH = 72;
const AXIS_BOTTOM_HEIGHT = 28;
const VOLUME_RATIO = 0.20; // Volume takes 20% of chart height
const MIN_CANDLE_WIDTH = 3;
const MAX_CANDLE_WIDTH = 40;
const CANDLE_GAP_RATIO = 0.3;

/* ------------------------------------------------------------------ */
/*  Utilities                                                          */
/* ------------------------------------------------------------------ */

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
  const volume = toNumber(item.v ?? item.volume ?? 0);

  if (open <= 0 || high <= 0 || low <= 0 || close <= 0) return null;
  return { time, open, high, low, close, volume };
}

function formatPrice(price: number): string {
  if (price <= 0) return '$0.00';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(2)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toPrecision(3)}`;
}

function formatAxisPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(1)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toPrecision(2)}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(2)}K`;
  return vol.toFixed(2);
}

function formatTime(ts: number, interval: Interval): string {
  const d = new Date(ts * 1000);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  const mon = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate().toString().padStart(2, '0');
  const yr = d.getUTCFullYear().toString().slice(2);

  if (interval === '1D') return `${mon} ${day} '${yr}`;
  return `${hh}:${mm}`;
}

function formatCrosshairTime(ts: number): string {
  const d = new Date(ts * 1000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[d.getUTCDay()];
  const day = d.getUTCDate().toString().padStart(2, '0');
  const mon = months[d.getUTCMonth()];
  const yr = d.getUTCFullYear().toString().slice(2);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${dayName} ${day} ${mon} '${yr}  ${hh}:${mm}`;
}

function formatFullTime(): string {
  const d = new Date();
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  const ss = d.getUTCSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss} UTC`;
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / pow;
  let nice: number;
  if (frac <= 1.5) nice = 1;
  else if (frac <= 3) nice = 2;
  else if (frac <= 7) nice = 5;
  else nice = 10;
  return nice * pow;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TokenChart({ address, tokenSymbol, tokenName }: TokenChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState('');

  const [interval, setInterval_] = useState<Interval>('15m');
  const [period, setPeriod] = useState<Period>('1D');

  // Viewport state: how many candles to show and offset from the right
  const [visibleCount, setVisibleCount] = useState(80);
  const [scrollOffset, setScrollOffset] = useState(0); // 0 = latest at right edge

  // Mouse state
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; offset: number } | null>(null);

  // Canvas dimensions
  const [dims, setDims] = useState({ w: 800, h: 400 });

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;
    const config = PERIOD_CONFIG[period];
    const effectiveInterval = interval; // use current interval
    const now = Math.floor(Date.now() / 1000);

    async function loadChart() {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchOHLCV(address, effectiveInterval, now - config.seconds, now);
        if (cancelled) return;

        const nextCandles = items
          .map(readCandle)
          .filter((c): c is Candle => Boolean(c))
          .sort((a, b) => a.time - b.time);

        setCandles(nextCandles);
        setScrollOffset(0);
        setVisibleCount(Math.min(80, Math.max(20, nextCandles.length)));
        setLoadedAt(formatFullTime());
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
  }, [address, interval, period]);

  /* ---------------------------------------------------------------- */
  /*  ResizeObserver                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDims({ w: Math.floor(width), h: Math.floor(height) });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Computed viewport                                                */
  /* ---------------------------------------------------------------- */

  const viewport = useMemo(() => {
    if (candles.length === 0) return null;

    const vc = Math.min(visibleCount, candles.length);
    const maxOffset = Math.max(0, candles.length - vc);
    const offset = Math.min(scrollOffset, maxOffset);
    const startIdx = Math.max(0, candles.length - vc - offset);
    const endIdx = Math.min(candles.length, startIdx + vc);
    const visible = candles.slice(startIdx, endIdx);

    if (visible.length === 0) return null;

    // Chart area (excluding axes)
    const chartW = dims.w - AXIS_RIGHT_WIDTH;
    const chartH = dims.h - AXIS_BOTTOM_HEIGHT;
    const priceChartH = chartH * (1 - VOLUME_RATIO);
    const volumeChartH = chartH * VOLUME_RATIO;

    // Candle geometry
    const candleW = Math.max(MIN_CANDLE_WIDTH, Math.min(MAX_CANDLE_WIDTH, chartW / visible.length));
    const bodyW = candleW * (1 - CANDLE_GAP_RATIO);
    const wickW = Math.max(1, bodyW * 0.1);

    // Price range with 5% padding
    const allHighs = visible.map(c => c.high);
    const allLows = visible.map(c => c.low);
    const priceMax = Math.max(...allHighs);
    const priceMin = Math.min(...allLows);
    const priceRange = priceMax - priceMin || priceMax * 0.01 || 1;
    const pricePadding = priceRange * 0.05;
    const yMax = priceMax + pricePadding;
    const yMin = Math.max(0, priceMin - pricePadding);
    const yRange = yMax - yMin;

    // Volume range
    const allVols = visible.map(c => c.volume);
    const volMax = Math.max(...allVols) || 1;

    return {
      visible,
      startIdx,
      endIdx,
      chartW,
      chartH,
      priceChartH,
      volumeChartH,
      candleW,
      bodyW,
      wickW,
      yMax,
      yMin,
      yRange,
      volMax,
    };
  }, [candles, visibleCount, scrollOffset, dims]);

  /* ---------------------------------------------------------------- */
  /*  Coordinate helpers                                               */
  /* ---------------------------------------------------------------- */

  const priceToY = useCallback((price: number) => {
    if (!viewport) return 0;
    const { yMax, yRange, priceChartH } = viewport;
    const topPad = 8;
    return topPad + ((yMax - price) / yRange) * (priceChartH - topPad * 2);
  }, [viewport]);

  const yToPrice = useCallback((y: number) => {
    if (!viewport) return 0;
    const { yMax, yRange, priceChartH } = viewport;
    const topPad = 8;
    return yMax - ((y - topPad) / (priceChartH - topPad * 2)) * yRange;
  }, [viewport]);

  const candleX = useCallback((idx: number) => {
    if (!viewport) return 0;
    return idx * viewport.candleW + viewport.candleW / 2;
  }, [viewport]);

  /* ---------------------------------------------------------------- */
  /*  Canvas rendering                                                 */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dims.w * dpr;
    canvas.height = dims.h * dpr;
    canvas.style.width = `${dims.w}px`;
    canvas.style.height = `${dims.h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const { visible, chartW, chartH, priceChartH, volumeChartH, candleW, bodyW, wickW, yMax, yMin, yRange, volMax } = viewport;

    // Clear
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, dims.w, dims.h);

    // ----- Grid lines (horizontal) -----
    const hTicks = Math.max(3, Math.floor(priceChartH / 60));
    const step = niceStep(yRange, hTicks);
    const firstTick = Math.ceil(yMin / step) * step;

    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR_AXIS_TEXT;

    for (let price = firstTick; price <= yMax; price += step) {
      const y = priceToY(price);
      if (y < 2 || y > priceChartH - 2) continue;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartW, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillText(formatAxisPrice(price), dims.w - 6, y);
    }

    // ----- Grid lines (vertical) / Time axis -----
    const timeStep = Math.max(1, Math.floor(visible.length / Math.max(3, Math.floor(chartW / 100))));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < visible.length; i += timeStep) {
      const x = candleX(i);
      if (x < 20 || x > chartW - 20) continue;

      ctx.strokeStyle = COLOR_GRID;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartH);
      ctx.stroke();

      // Time label
      ctx.fillStyle = COLOR_AXIS_TEXT;
      ctx.fillText(formatTime(visible[i].time, interval), x, chartH + 6);
    }

    // ----- Volume bars -----
    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      const x = candleX(i) - bodyW / 2;
      const isBull = c.close >= c.open;
      const volH = (c.volume / volMax) * (volumeChartH - 4);
      const volY = priceChartH + volumeChartH - volH;

      ctx.fillStyle = isBull ? COLOR_BULL_VOL : COLOR_BEAR_VOL;
      ctx.fillRect(x, volY, bodyW, volH);
    }

    // Volume separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, priceChartH);
    ctx.lineTo(chartW, priceChartH);
    ctx.stroke();

    // ----- Candlesticks -----
    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      const cx = candleX(i);
      const isBull = c.close >= c.open;
      const color = isBull ? COLOR_BULL : COLOR_BEAR;

      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBot = priceToY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(1, bodyBot - bodyTop);
      const wickTop = priceToY(c.high);
      const wickBot = priceToY(c.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = wickW;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx, wickTop);
      ctx.lineTo(cx, wickBot);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(cx - bodyW / 2, bodyTop, bodyW, bodyHeight);
    }

    // ----- Current price line -----
    const lastCandle = visible[visible.length - 1];
    if (lastCandle) {
      const curY = priceToY(lastCandle.close);
      const isBull = lastCandle.close >= lastCandle.open;

      ctx.strokeStyle = COLOR_PRICE_LINE;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(chartW, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price badge on right axis
      const badgeBg = isBull ? COLOR_BULL : COLOR_BEAR;
      const badgeText = formatAxisPrice(lastCandle.close);
      ctx.font = 'bold 10px monospace';
      const tw = ctx.measureText(badgeText).width;
      const bw = tw + 12;
      const bh = 18;
      const bx = chartW + 2;
      const by = curY - bh / 2;

      // Arrow
      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      ctx.moveTo(bx, curY);
      ctx.lineTo(bx + 5, by);
      ctx.lineTo(bx + bw + 5, by);
      ctx.lineTo(bx + bw + 5, by + bh);
      ctx.lineTo(bx + 5, by + bh);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, bx + 5 + bw / 2, curY);
    }

    // ----- Right axis border -----
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(chartW, 0);
    ctx.lineTo(chartW, dims.h);
    ctx.stroke();

    // ----- Bottom axis border -----
    ctx.beginPath();
    ctx.moveTo(0, chartH);
    ctx.lineTo(dims.w, chartH);
    ctx.stroke();

    // ----- Crosshair -----
    if (mousePos && mousePos.x < chartW && mousePos.y < chartH) {
      ctx.strokeStyle = COLOR_CROSSHAIR;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartW, mousePos.y);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartH);
      ctx.stroke();

      ctx.setLineDash([]);

      // Price label on Y-axis
      const hoverPrice = yToPrice(mousePos.y);
      if (hoverPrice > 0) {
        const labelText = formatAxisPrice(hoverPrice);
        ctx.font = 'bold 10px monospace';
        const lw = ctx.measureText(labelText).width + 12;
        const lh = 18;
        const lx = chartW + 2;
        const ly = mousePos.y - lh / 2;

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(lx, mousePos.y);
        ctx.lineTo(lx + 5, ly);
        ctx.lineTo(lx + lw + 5, ly);
        ctx.lineTo(lx + lw + 5, ly + lh);
        ctx.lineTo(lx + 5, ly + lh);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, lx + 5 + lw / 2, mousePos.y);
      }

      // Time label on X-axis
      const candleIdx = Math.round((mousePos.x - candleW / 2) / candleW);
      if (candleIdx >= 0 && candleIdx < visible.length) {
        const candle = visible[candleIdx];
        const labelText = formatCrosshairTime(candle.time);
        ctx.font = 'bold 10px monospace';
        const tw = ctx.measureText(labelText).width + 14;
        const th = 18;
        const tx = mousePos.x - tw / 2;
        const ty = chartH + 3;

        ctx.fillStyle = '#333';
        ctx.fillRect(tx, ty, tw, th);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, mousePos.x, ty + th / 2);
      }
    }
  }, [viewport, dims, mousePos, interval, priceToY, yToPrice, candleX]);

  /* ---------------------------------------------------------------- */
  /*  Mouse event handlers                                             */
  /* ---------------------------------------------------------------- */

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Dragging for pan
    if (isDragging && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const candlesPanned = Math.round(dx / viewport.candleW);
      const newOffset = Math.max(0, Math.min(candles.length - visibleCount, dragStartRef.current.offset + candlesPanned));
      setScrollOffset(newOffset);
    }

    // Find hovered candle
    const chartW = dims.w - AXIS_RIGHT_WIDTH;
    if (x < chartW) {
      const candleIdx = Math.round((x - viewport.candleW / 2) / viewport.candleW);
      if (candleIdx >= 0 && candleIdx < viewport.visible.length) {
        setHoveredCandle(viewport.visible[candleIdx]);
      } else {
        setHoveredCandle(null);
      }
    } else {
      setHoveredCandle(null);
    }
  }, [viewport, isDragging, candles.length, visibleCount, dims.w]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, offset: scrollOffset };
  }, [scrollOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
    setHoveredCandle(null);
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 5 : -5;
    setVisibleCount(prev => Math.max(10, Math.min(candles.length, prev + zoomDelta)));
  }, [candles.length]);

  const handleDoubleClick = useCallback(() => {
    setVisibleCount(Math.min(80, candles.length));
    setScrollOffset(0);
  }, [candles.length]);

  /* ---------------------------------------------------------------- */
  /*  Interval / Period handlers                                       */
  /* ---------------------------------------------------------------- */

  const handleIntervalChange = useCallback((newInterval: Interval) => {
    setInterval_(newInterval);
    // Auto-select a fitting period
    if (newInterval === '1m' || newInterval === '5m') setPeriod('1D');
    else if (newInterval === '15m') setPeriod('1D');
    else if (newInterval === '1H') setPeriod('1W');
    else if (newInterval === '4H') setPeriod('1M');
    else if (newInterval === '1D') setPeriod('3M');
  }, []);

  const handlePeriodChange = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
    const config = PERIOD_CONFIG[newPeriod];
    setInterval_(config.interval);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  OHLC info for hovered or last candle                             */
  /* ---------------------------------------------------------------- */

  const infoCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);
  const prevCandle = useMemo(() => {
    if (!infoCandle || candles.length < 2) return null;
    const idx = candles.findIndex(c => c.time === infoCandle.time);
    return idx > 0 ? candles[idx - 1] : null;
  }, [infoCandle, candles]);

  const priceChange = infoCandle && prevCandle ? infoCandle.close - prevCandle.close : 0;
  const priceChangePct = infoCandle && prevCandle && prevCandle.close > 0
    ? ((infoCandle.close - prevCandle.close) / prevCandle.close) * 100
    : 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex flex-col bg-[#0A0A0F] rounded-xl border border-[rgba(255,255,255,.05)] overflow-hidden h-full">
      {/* OHLC Info Bar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[rgba(255,255,255,.04)] min-h-[32px] flex-wrap">
        <span className="text-[11px] font-mono text-[#A0A0A0]">
          {tokenSymbol || 'Token'}{tokenName ? ` · ${tokenName}` : ''}
          <span className="text-[#555] ml-1">· {interval}</span>
        </span>

        {infoCandle && (
          <>
            <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums">
              <span className="text-[#6B7280]">O</span>
              <span className={infoCandle.close >= infoCandle.open ? 'text-[#26A69A]' : 'text-[#EF5350]'}>
                {formatPrice(infoCandle.open)}
              </span>
              <span className="text-[#6B7280]">H</span>
              <span className={infoCandle.close >= infoCandle.open ? 'text-[#26A69A]' : 'text-[#EF5350]'}>
                {formatPrice(infoCandle.high)}
              </span>
              <span className="text-[#6B7280]">L</span>
              <span className={infoCandle.close >= infoCandle.open ? 'text-[#26A69A]' : 'text-[#EF5350]'}>
                {formatPrice(infoCandle.low)}
              </span>
              <span className="text-[#6B7280]">C</span>
              <span className={infoCandle.close >= infoCandle.open ? 'text-[#26A69A]' : 'text-[#EF5350]'}>
                {formatPrice(infoCandle.close)}
              </span>
            </div>

            {prevCandle && (
              <span className={`text-[10px] font-mono font-bold tabular-nums ${priceChange >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                {priceChange >= 0 ? '+' : ''}{formatPrice(Math.abs(priceChange))} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
              </span>
            )}

            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="text-[#6B7280]">Volume</span>
              <span className="text-[#A0A0A0] tabular-nums">{formatVolume(infoCandle.volume)}</span>
            </div>
          </>
        )}
      </div>

      {/* Canvas chart area */}
      <div ref={containerRef} className="relative flex-1 min-h-[220px] min-w-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A0A0F]/90">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
              <span className="text-[#A0A0A0] text-xs font-mono">Loading chart...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {!loading && error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A0A0F]">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[#EF5350] text-sm font-mono">{error}</span>
              <button
                onClick={() => {
                  const np = period === '1D' ? '1W' : '1D';
                  handlePeriodChange(np as Period);
                }}
                className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20 transition-colors press-scale"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-[rgba(255,255,255,.05)] flex-wrap">
        {/* Interval buttons */}
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => handleIntervalChange(iv)}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all duration-200 press-scale ${
              interval === iv
                ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30'
                : 'text-[#6B7280] hover:text-[#A0A0A0] hover:bg-white/5 border border-transparent'
            }`}
          >
            {iv}
          </button>
        ))}

        <div className="w-px h-4 bg-[#1F1F1F] mx-1" />

        {/* Period buttons */}
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all duration-200 press-scale ${
              period === p
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-[#6B7280] hover:text-[#A0A0A0] hover:bg-white/5 border border-transparent'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Timestamp */}
        <span className="text-[9px] font-mono text-[#555] ml-auto tabular-nums">
          {loadedAt || '--:--:-- UTC'}
        </span>
      </div>
    </div>
  );
}
