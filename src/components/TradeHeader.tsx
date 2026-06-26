'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import SignInButton from './SignInButton';
import ProfileMenu from './profile/ProfileMenu';
import { fetchTrendingTokens, fetchTokenOverview } from '@/lib/birdeye';
import { useTokenBalances } from '@/lib/useTokenBalances';
import { useSelectedToken } from '@/lib/TokenContext';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function TradeHeader() {
  const { authenticated, user } = usePrivy();
  const { selectToken } = useSelectedToken();
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [solPrice, setSolPrice] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  // Real SOL balance for the authenticated user.
  const { sol } = useTokenBalances(SOL_MINT);

  useEffect(() => {
    fetchTrendingTokens().then(setTokens);
  }, []);

  useEffect(() => {
    fetchTokenOverview(SOL_MINT)
      .then((info) => { if (info?.price) setSolPrice(info.price); })
      .catch(() => {});
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setHighlightIndex(0);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Command palette keyboard handling
  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      (t.symbol ?? '').toLowerCase().includes(q) ||
      (t.name ?? '').toLowerCase().includes(q),
    );
  }, [tokens, search]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isFocused) return;

    if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightIndex(0);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredTokens.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTokens.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const token = filteredTokens[highlightIndex];
      if (token) {
        selectToken(token.address);
        window.history.pushState({}, '', `/trade/${token.address}`);
        setIsFocused(false);
        setSearch('');
        setHighlightIndex(0);
      }
    }
  }, [isFocused, filteredTokens, highlightIndex, selectToken]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [search]);

  // Global Ctrl+K or / to focus search
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsFocused(true);
      } else if (e.key === '/' && !isFocused) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsFocused(true);
        }
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [isFocused]);

  return (
    <header className="h-11 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center px-2.5 shrink-0">
      <div className="flex items-center w-full gap-3">
        {/* Left — Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo/dark.png" alt="ChadWallet" width={20} height={20} className="w-auto h-5 object-contain" />
        </Link>
        {/* Center — Search (command palette) */}
        <div className="relative flex-1 max-w-[400px] hidden sm:block mx-auto">
          <div ref={containerRef} className="relative">
            <div className={`flex h-7 items-center gap-1.5 rounded-md border ${
              isFocused ? 'border-[#39FF14]/60' : 'border-[#1F1F1F]'
            } bg-[#111111] px-2 transition-colors`}>
              <svg className="w-3.5 h-3.5 shrink-0 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                value={search}
                onFocus={() => setIsFocused(true)}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tokens... ( / )"
                aria-label="Search tokens"
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#888] font-mono"
              />
              {isFocused && (
                <div className="flex items-center gap-1">
                  <kbd className="text-[8px] font-mono text-[#888] bg-[#1F1F1F] px-1 rounded">↑↓</kbd>
                  <kbd className="text-[8px] font-mono text-[#888] bg-[#1F1F1F] px-1 rounded">↵</kbd>
                  <button onClick={() => { setIsFocused(false); setHighlightIndex(0); }} className="touch-target text-[9px] font-mono font-bold text-[#A0A0A0] hover:text-white">
                    ESC
                  </button>
                </div>
              )}
            </div>

            {/* Dropdown — command palette */}
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[#1F1F1F] bg-[#111111] overflow-hidden shadow-2xl z-50">
                <div className="px-3 py-1.5 text-[10px] text-[#A0A0A0] font-mono border-b border-[#1F1F1F] flex items-center gap-2">
                  <span>{search ? 'Results' : 'Trending'}</span>
                  <span className="ml-auto text-[#888]">
                    {filteredTokens.length > 0 && `${highlightIndex + 1}/${Math.min(filteredTokens.length, 12)}`}
                  </span>
                </div>
                <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
                  {filteredTokens.length === 0 ? (
                    <div className="p-4 text-center text-[#888] text-xs font-mono">No tokens found</div>
                  ) : (
                    filteredTokens.slice(0, 12).map((token, i) => {
                      const change = token.price_change_24h_percent ?? 0;
                      const positive = change >= 0;
                      const isHighlighted = i === highlightIndex;
                      return (
                        <button
                          key={token.address}
                          onClick={() => {
                            selectToken(token.address);
                            window.history.pushState({}, '', `/trade/${token.address}`);
                            setIsFocused(false);
                            setSearch('');
                            setHighlightIndex(0);
                          }}
                          onMouseEnter={() => setHighlightIndex(i)}
                          className={`flex items-center gap-2.5 px-3 py-2 transition-colors border-b border-[#1F1F1F]/50 last:border-0 w-full text-left ${
                            isHighlighted ? 'bg-[#39FF14]/10' : 'hover:bg-[#1A1A1A]'
                          }`}
                        >
                          {isHighlighted && (
                            <span className="text-[#39FF14] text-[10px] font-mono">▸</span>
                          )}
                          {token.logo_uri ? (
                            <img src={token.logo_uri} width={24} height={24} className="w-6 h-6 rounded-full shrink-0" alt={token.symbol} loading="lazy" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[9px] font-bold text-[#A0A0A0] shrink-0">
                              {(token.symbol ?? '?').slice(0, 2)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-white truncate">{token.symbol}</span>
                            <span className="text-[9px] text-[#888] font-mono truncate">{token.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white font-mono tabular-nums shrink-0">
                            {formatPrice(token.price)}
                          </span>
                          <span className={`text-[10px] font-bold tabular-nums shrink-0 w-16 text-right ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                            {positive ? '+' : ''}{change.toFixed(2)}%
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Cash card + Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {authenticated && (() => {
            const solUsd = sol * solPrice;
            return (
              <div className="flex items-center gap-2 bg-[#111111] border border-[#1F1F1F] rounded-md px-2.5 py-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{formatUsd(solUsd)}</span>
                  <span className="text-[9px] font-mono text-[#A0A0A0]">cash</span>
                </div>
                <div className="w-px h-3 bg-[#1F1F1F]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{sol.toFixed(3)} SOL</span>
                  <span className="text-[9px] font-mono text-[#A0A0A0]">balance</span>
                </div>
                <button
                  onClick={() => {
                    const el = document.querySelector('[data-fund-wallet]') as HTMLButtonElement;
                    if (el) el.click();
                  }}
                  className="text-[9px] font-mono font-bold text-[#39FF14] hover:text-[#39FF14]/80 transition-colors ml-0.5 press-scale"
                  title="Fund wallet"
                  aria-label="Fund wallet"
                >
                  +
                </button>
              </div>
            );
          })()}

          {/* Avatar / Sign in */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function formatPrice(price?: number): string {
  if (!price) return '$0.00';
  if (price >= 1) return '$' + price.toFixed(2);
  if (price >= 0.01) return '$' + price.toFixed(4);
  if (price >= 0.0001) return '$' + price.toFixed(6);
  return '$' + price.toPrecision(2);
}

function formatUsd(n: number): string {
  if (!n || n <= 0) return '$0.00';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}
