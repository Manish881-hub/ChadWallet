'use client';
import { useEffect, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';

export default function TrendingList({ current }: { current?: string }) {
  const [tokens, setTokens] = useState<any[]>([]);
  useEffect(() => { fetchTrendingTokens().then(setTokens); }, []);

  return (
    <div id="trending-list">
      <h2 className="text-lg font-bold mb-3">🔥 Trending</h2>
      {tokens.length === 0 && <p className="text-gray-500 text-sm">Loading...</p>}
      <ul className="flex flex-col gap-1">
        {tokens.map((token) => {
          const isActive = token.address === current;
          const change = token.price_change_24h_percent ?? 0;
          return (
            <li key={token.address}>
              <Link
                href={`/trade/${token.address}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
              >
                {token.logo_uri && (
                  <img src={token.logo_uri} className="w-6 h-6 rounded-full" alt={token.symbol} />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold truncate block">{token.symbol}</span>
                </div>
                <span className={`text-xs font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
