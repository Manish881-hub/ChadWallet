'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchTokenOverview } from '@/lib/birdeye';
import { brand } from '@/lib/brand';

interface TickerToken {
  symbol: string;
  address: string;
  logo?: string;
  price: string;
  change: string;
  changePct: number;
  positive: boolean;
}

const TICKER_MINTS = [
  { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { symbol: 'BTC', address: 'cbbtcf3aa214zXhbiAZQw', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { symbol: 'ETH', address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', logo: 'https://assets.coingecko.com/coins/images/26570/large/bonk.png' },
  { symbol: 'JUP', address: 'JUPyiwrYJFkyUP2HGCWoxkijsKxFvJBkGPVTNf7YwRap', logo: 'https://assets.coingecko.com/coins/images/29550/large/jup.png' },
  { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', logo: 'https://assets.coingecko.com/coins/images/30834/large/dogwifcoin.png' },
  { symbol: 'HYPE', address: '98sMhvDw', logo: 'https://assets.coingecko.com/coins/images/50882/large/hyperliquid.jpg' },
];

export default function TradeFooter() {
  const [tickers, setTickers] = useState<TickerToken[]>([]);

  useEffect(() => {
    TICKER_MINTS.forEach(async (t) => {
      try {
        const info = await fetchTokenOverview(t.address);
        if (!info) return;
        const change = info.price_change_24h_percent ?? 0;
        setTickers(prev => {
          // Avoid duplicates
          if (prev.find(p => p.symbol === t.symbol)) return prev;
          return [...prev, {
            symbol: t.symbol,
            address: t.address,
            logo: t.logo,
            price: formatPrice(info.price),
            change: `${Math.abs(change).toFixed(2)}%`,
            changePct: change,
            positive: change >= 0,
          }];
        });
      } catch {
        // silently skip
      }
    });
  }, []);

  return (
    <footer className="h-7 border-t border-[#1F1F1F] bg-[#0A0A0A] flex items-center px-2.5 shrink-0 gap-3 text-xs overflow-hidden">
      {/* Scrolling ticker */}
      <div className="flex-1 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-3 animate-[ticker-scroll_30s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
          {tickers.map(t => (
            <Link
              key={t.symbol}
              href={`/trade/${t.address}`}
              className="flex items-center gap-1.5 shrink-0 transition-opacity hover:opacity-80"
            >
              {t.logo && (
                <img alt={t.symbol} className="w-3.5 h-3.5 rounded-full border border-[#1F1F1F]" src={t.logo} />
              )}
              <span className="text-[10px] font-mono font-bold text-white">{t.symbol}</span>
              <span className="text-[10px] font-mono text-[#A0A0A0] tabular-nums">{t.price}</span>
              <span className={`text-[10px] font-mono font-bold tabular-nums ${t.positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                {t.positive ? '▲' : '▼'} {t.change}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right side status */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />
          <span className="text-[9px] font-mono font-bold text-[#00C853]">Live</span>
        </div>
        <div className="w-px h-3 bg-[#1F1F1F]" />
        <a href={brand.social.twitter} target="_blank" rel="noreferrer" className="text-[#A0A0A0] hover:text-white transition-colors">
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </a>
        <a href={brand.social.discord} target="_blank" rel="noreferrer" className="text-[#A0A0A0] hover:text-white transition-colors">
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <path d="M7.5 7.5c3.5-1 5.5-1 9 0"></path>
            <path d="M7 16.5c3.5 1 6.5 1 10 0"></path>
            <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"></path>
            <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.476-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"></path>
          </svg>
        </a>
      </div>

      {/* Ticker animation keyframes */}
      <style jsx>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}

function formatPrice(price?: number): string {
  if (!price) return '$0.00';
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1) return '$' + price.toFixed(2);
  if (price >= 0.01) return '$' + price.toFixed(4);
  return '$' + price.toPrecision(3);
}
