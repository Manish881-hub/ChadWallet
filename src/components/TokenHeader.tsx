'use client';

interface TokenHeaderProps {
  token: any;
}

function formatUSD(value: number): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPrice(value: number): string {
  if (!value || value <= 0) return '0.00';
  if (value >= 1) return value.toFixed(value >= 1000 ? 2 : 4);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toPrecision(3);
}

function formatCount(value: number): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export default function TokenHeader({ token }: TokenHeaderProps) {
  const change = token.price_change_24h_percent ?? 0;
  const positive = change >= 0;

  // Build the stats strip from whatever fields Birdeye returned.
  // Missing/zero fields are omitted so we never show a misleading "—".
  const stats: { label: string; value: string; tone?: 'up' | 'down' }[] = [];
  if (token.market_cap) stats.push({ label: 'Market Cap', value: formatUSD(token.market_cap) });
  if (token.real_fdv) stats.push({ label: 'FDV', value: formatUSD(token.real_fdv) });
  if (token.liquidity) stats.push({ label: 'Liquidity', value: formatUSD(token.liquidity) });
  if (token.volume_24h) stats.push({ label: 'Volume 24h', value: formatUSD(token.volume_24h) });
  if (token.holder) stats.push({ label: 'Holders', value: formatCount(token.holder) });

  const pct = (v: number) => ({ value: `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, tone: (v >= 0 ? 'up' : 'down') as 'up' | 'down' });
  if (token.price_change_5m_percent) stats.push({ label: '5m', ...pct(token.price_change_5m_percent) });
  if (token.price_change_1h_percent) stats.push({ label: '1h', ...pct(token.price_change_1h_percent) });
  if (token.price_change_6h_percent) stats.push({ label: '6h', ...pct(token.price_change_6h_percent) });

  return (
    <div className="flex flex-col gap-3">
      {/* Identity row */}
      <div className="flex items-center gap-3">
        {token.logo_uri ? (
          <img src={token.logo_uri} alt={token.symbol} className="w-10 h-10 rounded-full shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#12121B] shrink-0 flex items-center justify-center text-xs font-mono text-[#A0A0A0] border border-[rgba(255,255,255,.05)]">
            {(token.symbol ?? '?').slice(0, 2)}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">{token.symbol}</h1>
            <span className="text-xs md:text-sm text-[#A0A0A0] truncate">{token.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm md:text-base font-mono tabular-nums text-white">
              ${formatPrice(token.price)}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold tabular-nums ${
                positive ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-[#FF1744]/15 text-[#FF1744]'
              }`}
            >
              {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-[#12121B] border border-[rgba(255,255,255,.05)] min-w-[88px]"
            >
              <span className="text-[9px] uppercase tracking-wider font-mono text-[#A0A0A0]">{s.label}</span>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  s.tone === 'up' ? 'text-[#00C853]' : s.tone === 'down' ? 'text-[#FF1744]' : 'text-white'
                }`}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
