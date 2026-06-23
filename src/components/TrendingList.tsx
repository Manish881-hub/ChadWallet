'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';
import Sparkline from './Sparkline';

export default function TrendingList({ current }: { current?: string }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchTrendingTokens().then(setTokens); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      (t.symbol ?? '').toLowerCase().includes(q) ||
      (t.name ?? '').toLowerCase().includes(q),
    );
  }, [tokens, query]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Heading */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[rgba(255,255,255,.05)]">
        <span className="text-sm">🔥</span>
        <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">Trending</h2>
        <span className="ml-auto text-[10px] text-[#6B7280] font-mono tabular-nums">
          {tokens.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 pr-1">
        {tokens.length === 0 && (
          <div className="flex flex-col gap-2 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg skeleton" />
            ))}
          </div>
        )}

        {tokens.length > 0 && filtered.length === 0 && (
          <p className="text-[#A0A0A0] text-xs font-mono text-center py-8">No matches</p>
        )}

        <ul className="flex flex-col">
          {filtered.map((token) => {
            const isActive = token.address === current;
            const change = token.price_change_24h_percent ?? 0;
            const positive = change >= 0;
            return (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className={`flex items-center gap-2 px-3 py-2.5 transition-colors border-b border-[rgba(255,255,255,.03)] ${
                    isActive
                      ? 'bg-[#12121B] border-l-2 border-l-[#39FF14]'
                      : 'border-l-2 border-l-transparent hover:bg-white/[.02]'
                  }`}
                >
                  {token.logo_uri ? (
                    <img src={token.logo_uri} className="w-7 h-7 rounded-full shrink-0" alt={token.symbol} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#1F1F1F] shrink-0 flex items-center justify-center text-[9px] font-mono text-[#A0A0A0]">
                      {(token.symbol ?? '?').slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white truncate">{token.symbol}</span>
                      <span className="text-[9px] text-[#6B7280] font-mono tabular-nums">
                        {formatMarketCap(token.market_cap)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-mono tabular-nums text-white">
                        ${formatCompact(token.price)}
                      </span>
                      <span className={`text-[10px] font-mono tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                        {positive ? '+' : ''}{change.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <Sparkline address={token.address} width={40} height={16} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function formatCompact(value: number): string {
  if (!value || value <= 0) return '0';
  if (value >= 1) return value.toFixed(value >= 100 ? 0 : 2);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toPrecision(2);
}

function formatMarketCap(value: number): string {
  if (!value || value <= 0) return '';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
