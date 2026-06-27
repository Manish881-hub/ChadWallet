'use client';

import { useEffect, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type BannerToken = {
  address: string;
  symbol: string;
  logo_uri?: string;
  price?: number;
  price_change_24h_percent?: number;
};

function formatPrice(price: number | undefined): string {
  if (!price || price <= 0) return '$--';
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function TokenBanner({ position }: { position: 'top' | 'bottom' }) {
  const [tokens, setTokens] = useState<BannerToken[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetchTrendingTokens().then(setTokens).catch(() => {});
  }, []);

  const loop = tokens.length ? [...tokens, ...tokens] : [];

  return (
    <div className="overflow-hidden bg-transparent">
      {loop.length === 0 ? (
        <div className="h-9" aria-hidden="true" />
      ) : (
        <div
          className="w-full"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          }}
        >
          <div
            className={`flex gap-6 w-max ${position === 'bottom' ? 'animate-marquee-reverse' : 'animate-marquee'}`}
          >
            {loop.map((token, i) => {
              const change = token.price_change_24h_percent ?? 0;
              const positive = change >= 0;
              const alreadyHere = pathname === `/trade/${token.address}`;

              return (
                <Link
                  key={`${token.address}-${i}`}
                  href={alreadyHere ? pathname : `/trade/${token.address}`}
                  className={`flex items-center gap-2 whitespace-nowrap py-2 px-3 transition-colors shrink-0 ${
                    alreadyHere ? 'cursor-default opacity-60' : 'hover:bg-white/5'
                  }`}
                  onClick={alreadyHere ? (e) => e.preventDefault() : undefined}
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
                  <span className="text-xs font-mono text-[#A0A0A0] tabular-nums">
                    {formatPrice(token.price)}
                  </span>
                  <span className={`text-xs font-mono font-bold tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                    {positive ? '+' : '-'}{Math.abs(change).toFixed(1)}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
