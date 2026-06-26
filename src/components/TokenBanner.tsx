'use client';
import { useEffect, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';

/**
 * Rotating token banner (spec #4).
 * Marquee of real trending Solana tokens. Tapping a token opens /trade/{mint}.
 * Renders at top and bottom of the page (pass `position`).
 */
export default function TokenBanner({ position }: { position: 'top' | 'bottom' }) {
  const [tokens, setTokens] = useState<any[]>([]);
  useEffect(() => { fetchTrendingTokens().then(setTokens).catch(() => {}); }, []);

  // Duplicate the list so the marquee can loop seamlessly.
  const loop = tokens.length ? [...tokens, ...tokens] : [];

  return (
    <div className="overflow-hidden bg-[#0A0A0A] border-b border-[#1F1F1F]">
      {loop.length === 0 ? (
        <div className="h-9" aria-hidden="true" />
      ) : (
        <div
          className={`flex gap-6 w-max ${position === 'bottom' ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        >
          {loop.map((token, i) => {
            const change = token.price_change_24h_percent ?? 0;
            const positive = change >= 0;
            return (
              <Link
                key={`${token.address}-${i}`}
                href={`/trade/${token.address}`}
                className="flex items-center gap-2 whitespace-nowrap py-2 px-3 hover:bg-white/5 transition-colors shrink-0"
              >
                {token.logo_uri ? (
                  <img
                    src={token.logo_uri}
                    className="w-5 h-5 rounded-full"
                    alt={token.symbol}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[8px] font-bold text-[#A0A0A0]">
                    {(token.symbol ?? '?').slice(0, 2)}
                  </div>
                )}
                <span className="font-bold text-white text-xs font-mono">{token.symbol}</span>
                <span className={`text-xs font-mono font-bold tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                  {positive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
