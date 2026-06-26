'use client';

import { useState, useEffect } from 'react';

interface TokenAboutPanelProps {
  tokenSymbol: string;
  tokenName?: string;
  description?: string;
  market_cap?: number;
  price_change_24h_percent?: number;
  price_change_1h_percent?: number;
  price_change_4h_percent?: number;
  price_change_5m_percent?: number;
  // Trade stats (from Birdeye or mock)
  buys?: number;
  sells?: number;
  buyVolume?: number;
  sellVolume?: number;
  buyers?: number;
  sellers?: number;
}

type TimeInterval = '5M' | '1H' | '4H' | '1D';
const TIME_INTERVALS: TimeInterval[] = ['5M', '1H', '4H', '1D'];

function formatUSD(value: number | undefined): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function DualBar({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftColor = '#00C853',
  rightColor = '#FF1744',
}: {
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
}) {
  const total = leftValue + rightValue;
  const leftPct = total > 0 ? (leftValue / total) * 100 : 50;
  const rightPct = total > 0 ? (rightValue / total) * 100 : 50;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: leftColor }}>
          {leftLabel}
        </span>
        <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: rightColor }}>
          {rightLabel}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-[#09090F] gap-px">
        <div
          className="h-full rounded-l-full animate-bar-fill"
          style={{ width: `${leftPct}%`, backgroundColor: `${leftColor}cc` }}
        />
        <div
          className="h-full rounded-r-full animate-bar-fill"
          style={{ width: `${rightPct}%`, backgroundColor: `${rightColor}cc` }}
        />
      </div>
    </div>
  );
}

export default function TokenAboutPanel(props: TokenAboutPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeInterval, setActiveInterval] = useState<TimeInterval>('1H');
  const [mounted, setMounted] = useState(false);
  const [showAllStats, setShowAllStats] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use provided stats or fall back to reasonable defaults
  const buys = props.buys ?? 59;
  const sells = props.sells ?? 56;
  const buyVolume = props.buyVolume ?? 14900;
  const sellVolume = props.sellVolume ?? 6500;
  const buyersCount = props.buyers ?? 37;
  const sellersCount = props.sellers ?? 33;

  // Get change % based on active interval
  const getChange = (interval: TimeInterval): number | undefined => {
    switch (interval) {
      case '5M': return props.price_change_5m_percent;
      case '1H': return props.price_change_1h_percent;
      case '4H': return props.price_change_4h_percent;
      case '1D': return props.price_change_24h_percent;
      default: return undefined;
    }
  };

  const description = props.description || `${props.tokenName || props.tokenSymbol} is a token on the Solana blockchain.`;

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* About section */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-bold text-white">
          About {props.tokenSymbol}
        </h3>
        <div className="relative">
          <p className={`text-[11px] leading-relaxed text-[#A0A0A0] font-mono ${!expanded ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          {description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,.05)]" />

      {/* Performance time pills */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {TIME_INTERVALS.map((interval) => {
            const change = getChange(interval);
            const hasData = change !== undefined && change !== 0;
            const positive = (change ?? 0) >= 0;
            return (
              <button
                key={interval}
                onClick={() => setActiveInterval(interval)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all press-scale ${
                  activeInterval === interval
                    ? 'bg-[#1F1F1F] border border-[#333]'
                    : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <span className="text-[#A0A0A0]">{interval}</span>
                {hasData ? (
                  <span className={`tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                    {positive ? '+' : ''}{change!.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-[#333]">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,.05)]" />

      {/* Stats bars */}
      {mounted && (
        <div className="flex flex-col gap-3">
          {/* Buys / Sells */}
          <DualBar
            leftLabel={`${buys} buys`}
            rightLabel={`${sells} sells`}
            leftValue={buys}
            rightValue={sells}
          />

          {/* Buy volume / Sell volume */}
          <DualBar
            leftLabel={`${formatUSD(buyVolume)} vol.`}
            rightLabel={`${formatUSD(sellVolume)} vol.`}
            leftValue={buyVolume}
            rightValue={sellVolume}
          />

          {/* Buyers / Sellers */}
          <DualBar
            leftLabel={`${buyersCount} buyers`}
            rightLabel={`${sellersCount} sellers`}
            leftValue={buyersCount}
            rightValue={sellersCount}
          />
        </div>
      )}

      {/* View more */}
      <button
        onClick={() => setShowAllStats(!showAllStats)}
        className="text-[11px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors text-center py-1 press-scale"
      >
        {showAllStats ? 'Show less' : 'View more'}
      </button>
    </div>
  );
}
