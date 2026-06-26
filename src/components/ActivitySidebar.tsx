'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSelectedToken, useSidebar } from '@/lib/TokenContext';
import { fetchTrendingTokens } from '@/lib/birdeye';
import { motion, AnimatePresence } from 'framer-motion';

type SidebarTab = 'Alerts' | 'Tokens' | 'Leaderboard' | 'Feed';
type FilterChip = 'Watchlist' | 'Crypto' | 'Trending';

const TABS: SidebarTab[] = ['Alerts', 'Tokens', 'Leaderboard', 'Feed'];
const CHIPS: FilterChip[] = ['Watchlist', 'Crypto', 'Trending'];

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 260;

export default function ActivitySidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const { selectedToken, selectToken, loading: tokenLoading } = useSelectedToken();
  const [activeTab, setActiveTab] = useState<SidebarTab>('Tokens');
  const [activeChip, setActiveChip] = useState<FilterChip>('Trending');
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  useEffect(() => {
    setLoadingTokens(true);
    fetchTrendingTokens().then((data) => {
      setTokens(data);
      setLoadingTokens(false);
    }).catch(() => setLoadingTokens(false));
  }, []);

  // Filter tokens by active chip
  const filteredTokens = useMemo(() => {
    if (activeChip === 'Trending') return tokens;
    if (activeChip === 'Crypto') return tokens.filter((t: any) => t.price >= 0.01);
    // Watchlist — for now show a subset
    return tokens.slice(0, 5);
  }, [tokens, activeChip]);

  // Handle token click — update shared state
  const handleTokenClick = useCallback((address: string) => {
    selectToken(address);
    // Also update URL without full page reload
    window.history.pushState({}, '', `/trade/${address}`);
  }, [selectToken]);

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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col border-r border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden relative"
    >
      {/* Collapse toggle — always visible */}
      <button
        onClick={toggleCollapsed}
        className="absolute top-2 right-1 z-20 w-6 h-6 flex items-center justify-center rounded-md text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
        >
          <polyline points="13 17 8 12 13 7"></polyline>
        </svg>
      </button>

      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full min-h-0"
          >
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-1 mb-2 border-b border-[#1F1F1F] pb-2 mt-6">
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

            {/* Content */}
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
                  {/* Filter chips — actually change the list */}
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

                  {/* Token list — clicking updates shared state */}
                  <ul className="flex flex-col gap-0.5">
                    {filteredTokens.length === 0 && loadingTokens ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-11 rounded-lg skeleton" />
                      ))
                    ) : filteredTokens.length === 0 ? (
                      <div className="p-4 text-center text-[#555] text-xs font-mono">No tokens found</div>
                    ) : null}
                    {filteredTokens.map((token) => {
                      const isActive = selectedToken && token.address === selectedToken.address;
                      const change = token.price_change_24h_percent ?? 0;
                      const positive = change >= 0;
                      return (
                        <li key={token.address}>
                          <button
                            onClick={() => handleTokenClick(token.address)}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors w-full text-left ${
                              isActive ? 'bg-[#39FF14]/10 border border-[#39FF14]/20' : 'hover:bg-white/5 border border-transparent'
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
                          </button>
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
                    <Link
                      key={trader.rank}
                      href={`/profile/${trader.name}`}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <span className="text-[10px] font-mono text-[#A0A0A0] w-4 text-center">{trader.rank}</span>
                      <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {trader.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-white font-medium flex-1 truncate group-hover:text-[#4D62FF] transition-colors">{trader.name}</span>
                      <span className="text-[11px] font-mono text-[#00C853] tabular-nums">{trader.pnl}</span>
                      <span className="text-[10px] font-mono text-[#A0A0A0] tabular-nums">{trader.winRate}</span>
                    </Link>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed — show tiny icons */}
      {collapsed && (
        <div className="flex flex-col items-center pt-8 gap-3 w-full">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { toggleCollapsed(); setActiveTab(tab); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
              title={tab}
            >
              {tab === 'Alerts' && <span className="text-[12px]">🔔</span>}
              {tab === 'Tokens' && <span className="text-[12px]">🪙</span>}
              {tab === 'Leaderboard' && <span className="text-[12px]">🏆</span>}
              {tab === 'Feed' && <span className="text-[12px]">📡</span>}
            </button>
          ))}
        </div>
      )}
    </motion.aside>
  );
}
