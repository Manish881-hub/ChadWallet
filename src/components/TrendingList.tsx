'use client';
import { useEffect, useState } from 'react';
import { fetchTrendingTokens } from '@/lib/birdeye';
import Link from 'next/link';

const MOCK_ACTIVITY = [
  { trader: '0xdead...beef', action: 'Buy', usd: '$343.5K', token: 'ASTEROID', mc: '$77.4M MC', time: '4d', up: true },
  { trader: '0xcafe...babe', action: 'Sell', usd: '$128.2K', token: 'MOON', mc: '$12.1M MC', time: '2h', up: false },
  { trader: '0xface...feed', action: 'Buy', usd: '$892.1K', token: 'PEPE', mc: '$890K MC', time: '30m', up: true },
  { trader: '0xbaad...f00d', action: 'Buy', usd: '$45.0K', token: 'DOGE', mc: '$4.2B MC', time: '1d', up: true },
  { trader: '0xdaad...code', action: 'Sell', usd: '$67.8K', token: 'SHIB', mc: '$8.9B MC', time: '6h', up: false },
  { trader: '0x1234...5678', action: 'Buy', usd: '$1.2M', token: 'BONK', mc: '$2.1B MC', time: '15m', up: true },
];

const MOCK_LEADERBOARD = [
  { trader: 'moonbeam', pnl: '+$12.4M', trades: 342, winRate: 68, up: true },
  { trader: 'cryptoking', pnl: '+$8.2M', trades: 891, winRate: 62, up: true },
  { trader: 'diamond.hands', pnl: '+$5.1M', trades: 156, winRate: 71, up: true },
  { trader: 'rekt.trader', pnl: '-$2.3M', trades: 45, winRate: 32, up: false },
  { trader: 'whale.watcher', pnl: '+$3.7M', trades: 567, winRate: 59, up: true },
];

export default function TrendingList({ current }: { current?: string }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Tokens');
  const [activeFilter, setActiveFilter] = useState('Trending');

  useEffect(() => {
    fetchTrendingTokens().then(setTokens);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#09090F] border-r border-[rgba(255,255,255,.05)]">
      {/* Top Nav */}
      <div className="p-2 pl-3 rounded-t-xl bg-[#09090F] flex items-center shrink-0 border-b border-[rgba(255,255,255,.05)] relative">
        <div className="relative flex-1 min-w-0">
          <div className="no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab flex items-center gap-3 text-sm font-medium pr-8">
            <button 
              className={`flex-none flex items-center justify-start gap-1 text-left whitespace-nowrap transition-colors ${activeTab === 'Alerts' ? 'text-white' : 'text-[#6B7280] hover:text-white'}`}
              onClick={() => setActiveTab('Alerts')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Alerts
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,.1)]" aria-hidden="true"></div>
            <button 
              className={`flex-none text-left whitespace-nowrap transition-colors ${activeTab === 'Tokens' ? 'text-white' : 'text-[#6B7280] hover:text-white'}`}
              onClick={() => setActiveTab('Tokens')}
            >
              Tokens
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,.1)]" aria-hidden="true"></div>
            <button 
              className={`flex-none text-left whitespace-nowrap transition-colors ${activeTab === 'Leaderboard' ? 'text-white' : 'text-[#6B7280] hover:text-white'}`}
              onClick={() => setActiveTab('Leaderboard')}
            >
              Leaderboard
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,.1)]" aria-hidden="true"></div>
            <button 
              className={`flex-none text-left whitespace-nowrap transition-colors ${activeTab === 'Feed' ? 'text-white' : 'text-[#6B7280] hover:text-white'}`}
              onClick={() => setActiveTab('Feed')}
            >
              Feed
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#09090F] to-transparent"></div>
        </div>
        <div className="ml-auto flex items-center gap-1 shrink-0 bg-[#09090F] pl-1 z-10">
          <button className="text-[#6B7280] hover:text-white focus:outline-none p-1" aria-label="Collapse panel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 8 12 13 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="relative shrink-0 border-b border-[rgba(255,255,255,.02)]">
        <div className="no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab flex gap-2 p-2 px-3 pt-3 pb-2 whitespace-nowrap">
          {['Watchlist', 'Crypto', 'Trending', 'Most held', 'Graduated', 'Bonding'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-bold leading-none shrink-0 whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-[#1F2937] border border-[#374151] text-white'
                  : 'text-[#9CA3AF] border border-[rgba(255,255,255,.05)] hover:bg-[#12121B]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#09090F] to-transparent"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {/* Alerts / Feed — activity rows */}
        {(activeTab === 'Alerts' || activeTab === 'Feed') && (
          <ul className="flex flex-col">
            {MOCK_ACTIVITY.map((a, i) => (
              <li key={i}>
                <div className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,.03)]">
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] shrink-0 flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                    {a.trader.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs text-[#6B7280] font-mono">{a.trader}</span>
                      <span className="text-xs text-[#6B7280] font-mono">traders</span>
                      <span className={`text-xs font-bold font-mono ${a.up ? 'text-[#00C853]' : 'text-[#FF4D4D]'}`}>
                        {a.action}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{a.usd}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#A0A0A0] font-mono">{a.token}</span>
                      <span className="text-[11px] text-[#6B7280] font-mono">at {a.mc}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-[#6B7280] font-mono">{a.time}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Tokens — token watchlist */}
        {activeTab === 'Tokens' && (
          tokens.length === 0 ? (
            <div className="flex flex-col gap-2 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-[#12121B] animate-pulse" />
              ))}
            </div>
          ) : (
            <ul className="flex flex-col">
              {tokens.map((token) => {
                const isActive = token.address === current;
                const change = token.price_change_24h_percent ?? 0;
                const positive = change >= 0;
                return (
                  <li key={token.address}>
                    <Link
                      href={`/trade/${token.address}`}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-[#1A1A24]'
                          : 'hover:bg-[rgba(255,255,255,.03)]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {token.logo_uri ? (
                          <img src={token.logo_uri} className="w-10 h-10 rounded-full" alt={token.symbol} />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center text-xs font-bold text-[#A0A0A0]">
                            {(token.symbol ?? '?').slice(0, 2)}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#09090F] rounded-full p-[2px]">
                          <div className="bg-[#3B82F6] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold">
                            ✓
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-sm text-white truncate">{token.symbol}</span>
                        <span className="text-[12px] text-[#A0A0A0] tabular-nums truncate">
                          {formatPriceWithSubscript(token.price)}
                        </span>
                      </div>

                      <div className="flex flex-col items-end shrink-0 ml-2">
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatMarketCap(token.market_cap)} MC
                        </span>
                        <span className={`text-[12px] font-bold tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF4D4D]'}`}>
                          {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {/* Leaderboard */}
        {activeTab === 'Leaderboard' && (
          <ul className="flex flex-col">
            {MOCK_LEADERBOARD.map((l, i) => (
              <li key={i}>
                <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,.03)]">
                  <span className="w-5 text-[10px] font-mono text-[#6B7280] shrink-0 text-right">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] shrink-0 flex items-center justify-center text-[10px] font-bold text-[#6B7280]">
                    {l.trader.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold text-white truncate">@{l.trader}</span>
                    <span className="text-[10px] text-[#6B7280] font-mono">{l.trades} trades · {l.winRate}% win</span>
                  </div>
                  <span className={`text-xs font-bold font-mono tabular-nums ${l.up ? 'text-[#00C853]' : 'text-[#FF4D4D]'}`}>
                    {l.pnl}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer / Split Buttons */}
      <div className="shrink-0 flex items-center gap-2 p-3 border-t border-[rgba(255,255,255,.05)]">
        <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-[rgba(255,255,255,.05)] text-xs font-bold text-[#6B7280] hover:bg-[#12121B] hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          Split bottom
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-[rgba(255,255,255,.05)] text-xs font-bold text-[#6B7280] hover:bg-[#12121B] hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          Split right
        </button>
      </div>
    </div>
  );
}

function formatMarketCap(value: number): string {
  if (!value || value <= 0) return '';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPriceWithSubscript(price?: number) {
  if (!price) return '$0.00';
  if (price >= 0.01) return '$' + price.toFixed(4).replace(/\.?0+$/, '');
  
  const str = price.toFixed(10);
  const match = str.match(/^0\.0+/);
  if (match) {
    const zeroCount = match[0].length - 2; 
    if (zeroCount >= 2) {
      const remaining = str.slice(match[0].length).slice(0, 4);
      return (
        <span className="inline-flex items-baseline">
          $0.0<sub className="text-[10px] leading-none translate-y-[2px]">{zeroCount}</sub>{remaining}
        </span>
      );
    }
  }
  return '$' + price.toPrecision(4);
}
