'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import SignInButton from './SignInButton';
import { fetchTrendingTokens, fetchTokenOverview } from '@/lib/birdeye';
import { useTokenBalances } from '@/lib/useTokenBalances';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function TradeHeader() {
  const { authenticated, user } = usePrivy();
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [solPrice, setSolPrice] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFocused) {
        setIsFocused(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const filteredTokens = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter((t) =>
      (t.symbol ?? '').toLowerCase().includes(q) ||
      (t.name ?? '').toLowerCase().includes(q),
    );
  }, [tokens, search]);

  return (
    <header className="h-11 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center px-2.5 shrink-0">
      <div className="flex items-center w-full gap-3">
        {/* Left — Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo/dark.png" alt="Logo" className="w-auto h-5 object-contain" />
        </Link>
        {/* Center — Search */}
        <div className="relative flex-1 max-w-[400px] hidden sm:block mx-auto">
          <div ref={containerRef} className="relative">
            <div className={`flex h-7 items-center gap-1.5 rounded-md border ${
              isFocused ? 'border-[#39FF14]/60' : 'border-[#1F1F1F]'
            } bg-[#111111] px-2 transition-colors`}>
              <svg className="w-3.5 h-3.5 shrink-0 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                value={search}
                onFocus={() => setIsFocused(true)}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tokens..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#555] font-mono"
              />
              {isFocused && (
                <button onClick={() => setIsFocused(false)} className="text-[9px] font-mono font-bold text-[#A0A0A0] hover:text-white">
                  ESC
                </button>
              )}
            </div>

            {/* Dropdown */}
            {isFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[#1F1F1F] bg-[#111111] overflow-hidden shadow-2xl z-50">
                <div className="px-3 py-1.5 text-[10px] text-[#A0A0A0] font-mono border-b border-[#1F1F1F]">
                  {search ? 'Results' : 'Trending'}
                </div>
                <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
                  {filteredTokens.length === 0 ? (
                    <div className="p-4 text-center text-[#555] text-xs font-mono">No tokens found</div>
                  ) : (
                    filteredTokens.slice(0, 12).map(token => {
                      const change = token.price_change_24h_percent ?? 0;
                      const positive = change >= 0;
                      return (
                        <Link
                          key={token.address}
                          href={`/trade/${token.address}`}
                          onClick={() => { setIsFocused(false); setSearch(''); }}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#1A1A1A] transition-colors border-b border-[#1F1F1F]/50 last:border-0"
                        >
                          {token.logo_uri ? (
                            <img src={token.logo_uri} className="w-6 h-6 rounded-full shrink-0" alt={token.symbol} />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[9px] font-bold text-[#A0A0A0] shrink-0">
                              {(token.symbol ?? '?').slice(0, 2)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-white truncate">{token.symbol}</span>
                            <span className="text-[9px] text-[#555] font-mono truncate">{token.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white font-mono tabular-nums shrink-0">
                            {formatPrice(token.price)}
                          </span>
                          <span className={`text-[10px] font-bold tabular-nums shrink-0 w-16 text-right ${positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>
                            {positive ? '+' : ''}{change.toFixed(2)}%
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Cash card + Portfolio + Avatar */}
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
                <button className="text-[9px] font-mono font-bold text-[#39FF14] hover:text-[#39FF14]/80 transition-colors ml-0.5" title="Fund wallet">
                  +
                </button>
              </div>
            );
          })()}

          {/* Avatar / Sign in */}
          <div className="w-7 h-7 rounded-full bg-[#111111] border border-[#1F1F1F] flex items-center justify-center overflow-hidden">
            {authenticated ? (
              <div className="w-full h-full bg-gradient-to-br from-[#39FF14]/40 to-[#00C853]/40 flex items-center justify-center text-[9px] font-bold text-white">
                {(user?.wallet?.address ?? 'U').slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
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
