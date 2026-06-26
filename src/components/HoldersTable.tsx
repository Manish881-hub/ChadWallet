'use client';

import { useEffect, useState } from 'react';
import { getTokenHolders, type TokenHolder } from '@/lib/solana';

function shortAddr(addr: string): string {
  if (!addr) return '—';
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function formatAmount(n: number): string {
  if (!n) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const AVATAR_COLORS = [
  'from-[#39FF14]/30 to-[#00C853]/30',
  'from-[#FF1744]/30 to-[#FF6B35]/30',
  'from-[#6366F1]/30 to-[#8B5CF6]/30',
  'from-[#F59E0B]/30 to-[#EAB308]/30',
  'from-[#06B6D4]/30 to-[#3B82F6]/30',
  'from-[#EC4899]/30 to-[#F43F5E]/30',
  'from-[#10B981]/30 to-[#14B8A6]/30',
  'from-[#F97316]/30 to-[#EF4444]/30',
];

export default function HoldersTable({ address }: { address: string }) {
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTokenHolders(address, 20)
      .then((data) => {
        if (cancelled) return;
        setHolders(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load holders');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [address]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[2fr_1.4fr_1fr] gap-2 px-2.5 py-1.5 border-b border-[#1F1F1F] sticky top-0 bg-[#111111] z-10">
        <span className="text-[#555] font-medium uppercase tracking-wider text-[9px] font-mono">Token Account</span>
        <span className="text-right text-[#555] font-medium uppercase tracking-wider text-[9px] font-mono">Amount</span>
        <span className="text-right text-[#555] font-medium uppercase tracking-wider text-[9px] font-mono">% Supply</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {loading && (
          <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1.4fr_1fr] gap-2 px-2.5 py-2.5 border-b border-[#1F1F1F]/40">
                <div className="h-3 rounded skeleton" />
                <div className="h-3 rounded skeleton justify-self-end w-20" />
                <div className="h-3 rounded skeleton justify-self-end w-10" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center h-24 px-4">
            <span className="text-[#A0A0A0] text-[11px] font-mono text-center">{error}</span>
          </div>
        )}

        {!loading && !error && holders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 gap-1 px-4 text-center">
            <span className="text-[#A0A0A0] text-[11px] font-mono">No holder data available</span>
            <span className="text-[#555] text-[10px] font-mono">Native mints (e.g. SOL) don't report SPL holders</span>
          </div>
        )}

        {!loading && !error && holders.map((h, i) => (
          <div
            key={h.address}
            className="grid grid-cols-[2fr_1.4fr_1fr] gap-2 px-2.5 py-2 border-b border-[#1F1F1F]/40 hover:bg-white/[.02] transition-colors"
          >
            <a
              href={`https://solscan.io/account/${h.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 min-w-0 hover:text-[#39FF14] transition-colors"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[8px] font-bold text-white shrink-0`}>
                {i + 1}
              </div>
              <span className="text-[10px] text-white font-mono truncate">{shortAddr(h.address)}</span>
            </a>
            <span className="px-1 py-0.5 text-right text-[10px] text-white tabular-nums font-bold font-mono">
              {formatAmount(h.amount)}
            </span>
            <span className="px-1 py-0.5 text-right text-[10px] text-[#A0A0A0] tabular-nums font-mono">
              {h.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
