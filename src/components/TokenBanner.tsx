'use client';
import { useEffect, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';

export default function TokenBanner({ position }: { position: 'top' | 'bottom' }) {
  const [tokens, setTokens] = useState<any[]>([]);
  useEffect(() => { fetchTrendingTokens().then(setTokens); }, []);

  if (!tokens.length) return null;

  return (
    <div className="overflow-hidden border-b border-gray-800">
      <div className={`flex gap-8 animate-marquee ${position === 'bottom' ? 'animate-marquee-reverse' : ''}`}>
        {/* Duplicate to create seamless loop */}
        {[...tokens, ...tokens].map((token, i) => (
          <Link
            key={(token.address || i) + '-' + i}
            href={`/trade/${token.address}`}
            className="flex items-center gap-2 whitespace-nowrap py-2 px-4 hover:bg-gray-900 transition-colors"
          >
            {token.logo_uri && (
              <img src={token.logo_uri} className="w-6 h-6 rounded-full" alt={token.symbol} />
            )}
            <span className="font-bold">{token.symbol}</span>
            <span className={(token.price_change_24h_percent ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}>
              {(token.price_change_24h_percent ?? 0).toFixed(1)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}