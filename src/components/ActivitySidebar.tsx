'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { fetchTrendingTokens } from '@/lib/birdeye';

type SidebarTab = 'Alerts' | 'Tokens' | 'Leaderboard' | 'Feed';
type FilterChip = 'Watchlist' | 'Crypto' | 'Trending';

const TABS: SidebarTab[] = ['Alerts', 'Tokens', 'Leaderboard', 'Feed'];
const CHIPS: FilterChip[] = ['Watchlist', 'Crypto', 'Trending'];

export default function ActivitySidebar({ current }: { current?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('Tokens');
  const [activeChip, setActiveChip] = useState<FilterChip>('Trending');
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => { fetchTrendingTokens().then(setTokens); }, []);

  // Placeholder content for non-token tabs
  const alertCards = useMemo(
    () => [
      { text: '40 traders bought', token: 'ASTEROID', vol: '$343.5K', mc: '$77.4M MC', type: 'buy' },
      { text: '21 traders bought', token: 'POPCAT', vol: '$128.2K', mc: '$52.1M MC', type: 'buy' },
      { text: '20 traders sold', token: 'GOBLINTOWN', vol: '$89.3K', mc: '$12.6M MC', type: 'sell' },
      { text: '15 traders bought', token: 'BONK', vol: '$67.8K', mc: '$1.2B MC', type: 'buy' },
      { text: '12 traders sold', token: 'WIF', vol: '$45.1K', mc: '$890M MC', type: 'sell' },
    ],
    [],
  );

  const feedItems = useMemo(
    () => [
      { user: 'whale_0x3f', action: 'bought', token: 'ASTEROID', amount: '$12,400', time: '2m' },
      { user: 'degensol', action: 'sold', token: 'POPCAT', amount: '$8,200', time: '5m' },
      { user: 'moonshot_', action: 'bought', token: 'BONK', amount: '$5,600', time: '8m' },
      { user: 'sol_alpha', action: 'bought', token: 'ESOR', amount: '$3,100', time: '12m' },
      { user: 'trader99', action: 'sold', token: 'SQUIRE', amount: '$2,400', time: '15m' },
      { user: 'chadwallet', action: 'bought', token: 'FTFA', amount: '$1,800', time: '18m' },
    ],
    [],
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-1 mb-2 border-b border-[#1F1F1F] pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'text-white bg-white/10'
                : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 pr-0.5">
        {activeTab === 'Alerts' && (
          <div className="flex flex-col gap-1.5 px-0.5">
            {alertCards.map((card, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-[#111111] hover:bg-white/5 transition-colors"
              >
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  card.type === 'buy' ? 'bg-[#00C853]/15' : 'bg-[#FF1744]/15'
                }`}>
                  <span className={`text-[10px] font-bold ${card.type === 'buy' ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                    {card.type === 'buy' ? '▲' : '▼'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-white font-medium leading-tight">
                    {card.text} <span className="text-[#39FF14]">{card.token}</span>
                  </p>
                  <p className="text-[10px] text-[#A0A0A0] mt-0.5 font-mono tabular-nums">
                    {card.vol} · {card.mc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Tokens' && (
          <>
            {/* Filter chips */}
            <div className="flex gap-1.5 mb-2 px-1">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-full transition-colors ${
                    activeChip === chip
                      ? 'text-white bg-white/10 border border-white/20'
                      : 'text-[#A0A0A0] border border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Token list */}
            <ul className="flex flex-col gap-0.5">
              {tokens.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-11 rounded-lg skeleton" />
                ))}
              {tokens.map((token) => {
                const isActive = token.address === current;
                const change = token.price_change_24h_percent ?? 0;
                const positive = change >= 0;
                return (
                  <li key={token.address}>
                    <Link
                      href={`/trade/${token.address}`}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-[#39FF14]/10 border border-[#39FF14]/20' : 'hover:bg-white/5'
                      }`}
                    >
                      {token.logo_uri ? (
                        <img src={token.logo_uri} className="w-6 h-6 rounded-full shrink-0" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#1F1F1F] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-[12px] text-white truncate block leading-tight">
                          {token.symbol}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[10px] font-mono tabular-nums text-white">
                          ${token.price > 0 ? (token.price >= 1 ? token.price.toFixed(2) : token.price.toFixed(6)) : '0.00'}
                        </span>
                        <span className={`text-[10px] font-mono tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                          {positive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {activeTab === 'Leaderboard' && (
          <div className="flex flex-col gap-0.5 px-0.5">
            {[
              { rank: 1, name: 'whale_0x3f', pnl: '+$124,500', winRate: '78%' },
              { rank: 2, name: 'degensol', pnl: '+$89,200', winRate: '72%' },
              { rank: 3, name: 'moonshot_', pnl: '+$67,800', winRate: '71%' },
              { rank: 4, name: 'sol_alpha', pnl: '+$45,300', winRate: '68%' },
              { rank: 5, name: 'chadwallet', pnl: '+$34,100', winRate: '65%' },
            ].map((trader) => (
              <div
                key={trader.rank}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-[10px] font-mono text-[#A0A0A0] w-4 text-center">{trader.rank}</span>
                <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  {trader.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] text-white font-medium flex-1 truncate">{trader.name}</span>
                <span className="text-[11px] font-mono text-[#00C853] tabular-nums">{trader.pnl}</span>
                <span className="text-[10px] font-mono text-[#A0A0A0] tabular-nums">{trader.winRate}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Feed' && (
          <div className="flex flex-col gap-1 px-0.5">
            {feedItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                  {item.user.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white leading-tight">
                    <span className="font-medium">{item.user}</span>{' '}
                    <span className={item.action === 'bought' ? 'text-[#00C853]' : 'text-[#FF1744]'}>
                      {item.action}
                    </span>{' '}
                    <span className="text-[#39FF14]">{item.token}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-mono text-white tabular-nums">{item.amount}</span>
                  <span className="text-[9px] text-[#A0A0A0]">{item.time} ago</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
