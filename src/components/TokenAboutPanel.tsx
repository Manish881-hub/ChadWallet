'use client';

interface TokenAboutPanelProps {
  market_cap?: number;
  price_change_24h_percent?: number;
  price_change_1h_percent?: number;
  price_change_6h_percent?: number;
}

function formatUSD(value: number | undefined): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function StatBar({ label, value, pct }: { label: string; value: string; pct: number | undefined }) {
  const positive = (pct ?? 0) >= 0;
  const fillWidth = Math.min(Math.abs(pct ?? 0), 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-[#6B7280] w-6 shrink-0 uppercase">{label}</span>
      <div className="flex-1 h-2 bg-[#09090F] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${positive ? 'bg-[#00C853]' : 'bg-[#FF1744]'}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono tabular-nums w-14 text-right shrink-0 ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
        {positive ? '+' : ''}{(pct ?? 0).toFixed(2)}%
      </span>
    </div>
  );
}

export default function TokenAboutPanel(props: TokenAboutPanelProps) {
  const buyCount = 24;
  const sellCount = 39;
  const total = buyCount + sellCount;
  const buyPct = (buyCount / total) * 100;
  const sellPct = (sellCount / total) * 100;
  const buyers = 16;
  const sellers = 36;

  const pct24h = props.price_change_24h_percent;
  const pct1h = props.price_change_1h_percent;
  const pct7h = props.price_change_6h_percent;

  return (
    <div className="flex flex-col gap-3">
      {/* Market Cap */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Market Cap</span>
        <span className="text-xs font-mono font-bold text-white tabular-nums">{formatUSD(props.market_cap)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,.05)]" />

      {/* Price change bars */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">Price Change</span>
        {pct24h !== undefined && (
          <StatBar label="24H" value="" pct={pct24h} />
        )}
        {pct1h !== undefined && (
          <StatBar label="1H" value="" pct={pct1h} />
        )}
        {pct7h !== undefined && (
          <StatBar label="7H" value="" pct={pct7h} />
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,.05)]" />

      {/* Buy vs Sell bars */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#00C853] font-bold">{buyCount} buys</span>
          <span className="text-[10px] font-mono text-[#FF1744] font-bold">{sellCount} sells</span>
        </div>

        {/* Dual bar container */}
        <div className="flex h-3 rounded-full overflow-hidden bg-[#09090F]">
          <div
            className="h-full bg-[#00C853]/80 rounded-l-full transition-all"
            style={{ width: `${buyPct}%` }}
          />
          <div
            className="h-full bg-[#FF1744]/80 rounded-r-full transition-all"
            style={{ width: `${sellPct}%` }}
          />
        </div>

        {/* Buyers vs sellers */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-[#00C853]/70">{buyers} buyers</span>
          <span className="text-[9px] font-mono text-[#FF1744]/70">{sellers} sellers</span>
        </div>
      </div>
    </div>
  );
}
