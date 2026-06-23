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
      <div className="flex items-center gap-2 px-1 mb-3">
        <span className="text-base">🔥</span>
        <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Trending</h2>
        <span className="ml-auto text-[10px] text-[#A0A0A0] font-mono tabular-nums">
          {tokens.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-1 mb-3">
        <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg border border-[#1F1F1F] focus-within:border-[#39FF14]/40 transition-colors px-3">
          <svg className="w-3.5 h-3.5 text-[#A0A0A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token..."
            className="flex-1 bg-transparent py-2 text-xs text-white font-mono outline-none placeholder:text-[#555]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#A0A0A0] hover:text-white text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
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

        <ul className="flex flex-col gap-1">
          {filtered.map((token) => {
            const isActive = token.address === current;
            const change = token.price_change_24h_percent ?? 0;
            const positive = change >= 0;
            return (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors border ${
                    isActive
                      ? 'bg-[#111111] border-[#39FF14]/30'
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  {token.logo_uri ? (
                    <img src={token.logo_uri} className="w-6 h-6 rounded-full shrink-0" alt={token.symbol} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#1F1F1F] shrink-0 flex items-center justify-center text-[9px] font-mono text-[#A0A0A0]">
                      {(token.symbol ?? '?').slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-white truncate block leading-tight">{token.symbol}</span>
                    <span className="text-[10px] text-[#A0A0A0] truncate block leading-tight">{token.name}</span>
                  </div>

                  <Sparkline address={token.address} width={44} height={18} />

                  <div className="flex flex-col items-end shrink-0 w-14">
                    <span className="text-[11px] font-mono tabular-nums text-white">
                      ${formatCompact(token.price)}
                    </span>
                    <span className={`text-[10px] font-mono tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                      {positive ? '+' : ''}{change.toFixed(1)}%
                    </span>
                  </div>
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
