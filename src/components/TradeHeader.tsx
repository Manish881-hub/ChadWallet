'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import SignInButton from './SignInButton';
import { fetchTrendingTokens } from '@/lib/birdeye';

export default function TradeHeader() {
  const { authenticated, user } = usePrivy();
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrendingTokens().then(setTokens);
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
    <header className="pr-4 py-2 border-b border-[rgba(255,255,255,.05)] bg-[#09090F]">
      <div className="flex items-center justify-between px-1">
        {/* Left Side - Logo */}
        <div className="flex gap-6 items-center min-w-0 flex-1">
          <Link href="/" className="flex items-center" data-discover="true">
            <img src="/logo/dark.png" alt="Logo" className="w-auto h-6 object-contain" />
          </Link>
        </div>

        {/* Center - Search Bar */}
        <div className="relative w-[320px] md:w-[400px] lg:w-[640px] min-w-[320px] h-12 mt-1 hidden sm:block">
          <div ref={containerRef} className="absolute top-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col">
            <div className="relative">
              <div className="relative z-10 flex flex-col">
                <div className={`flex h-12 items-center gap-2 rounded-xl border ${isFocused ? 'border-[#39FF14]' : 'border-[#1F2937]'} bg-[#12121B] hover:bg-[#1A1A24] px-3 cursor-text transition-colors`}>
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#6B7280]">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        value={search}
                        onFocus={() => setIsFocused(true)}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for tokens or traders..."
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-normal leading-none text-white outline-none placeholder:text-[#6B7280]"
                      />
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button type="button" className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#1F2937] text-[#9CA3AF] hover:text-white cursor-pointer transition-colors">
                      Paste
                    </button>
                    {isFocused ? (
                      <button onClick={() => setIsFocused(false)} type="button" className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#1F2937] text-[#9CA3AF] hover:text-white cursor-pointer transition-colors">
                        ESC
                      </button>
                    ) : (
                      <div className="text-[10px] font-bold min-w-5 text-center px-1.5 py-0.5 rounded-sm bg-[#1F2937] text-[#9CA3AF]">
                        /
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdown */}
              {isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[rgba(255,255,255,.05)] bg-[#12121B]/95 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col z-50">
                  <div className="px-4 py-3 text-sm text-[#A0A0A0] font-medium border-b border-[rgba(255,255,255,.05)]">
                    {search ? 'Search Results' : 'Trending tokens'}
                  </div>
                  <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
                    {filteredTokens.length === 0 ? (
                      <div className="p-4 text-center text-[#6B7280] text-sm">No tokens found</div>
                    ) : (
                      filteredTokens.map(token => {
                        const change = token.price_change_24h_percent ?? 0;
                        const positive = change >= 0;
                        return (
                          <Link 
                            key={token.address} 
                            href={`/trade/${token.address}`} 
                            onClick={() => { setIsFocused(false); setSearch(''); }} 
                            className="flex items-center gap-4 px-4 py-3 hover:bg-[#1A1A24] transition-colors border-b border-[rgba(255,255,255,.02)] last:border-0 w-full"
                          >
                            <div className="relative shrink-0">
                              {token.logo_uri ? (
                                <img src={token.logo_uri} className="w-10 h-10 rounded-full" alt={token.symbol} />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center text-xs font-bold text-[#A0A0A0]">
                                  {(token.symbol ?? '?').slice(0, 2)}
                                </div>
                              )}
                              <div className="absolute -bottom-0.5 -right-0.5 bg-[#12121B] rounded-full p-[2px]">
                                <div className="bg-[#3B82F6] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold">
                                  ✓
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-white truncate">{token.symbol}</span>
                                <div className="flex items-center gap-1.5 opacity-60">
                                  <span className="bg-[#2A2A36] text-white text-[10px] px-1 rounded flex items-center justify-center h-[16px]">≡</span>
                                  <span className="bg-[#2A2A36] text-white text-[10px] px-1 rounded flex items-center justify-center h-[16px]">𝕏</span>
                                  <span className="text-[#A0A0A0] text-sm leading-none flex items-center h-[16px]">☆</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-[12px] mt-0.5">
                                <span className="text-[#A0A0A0] truncate">{token.name}</span>
                                <span className="text-[#4B5563] font-mono shrink-0">{shortenAddress(token.address)}</span>
                              </div>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-2 shrink-0 w-[120px]">
                               <span className="text-[9px] font-bold text-[#A0A0A0] bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#374151]">MC</span>
                               <span className="text-sm font-bold text-white font-mono">{formatMarketCap(token.market_cap)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between shrink-0 w-[150px] gap-4">
                              <span className="text-sm font-bold text-white font-mono flex items-baseline">{formatPriceWithSubscript(token.price)}</span>
                              <span className={`text-[12px] font-bold tabular-nums ${positive ? 'text-[#00C853]' : 'text-[#FF4D4D]'}`}>
                                {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                              </span>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-2 shrink-0 w-[120px] justify-end">
                               <span className="text-[9px] font-bold text-[#A0A0A0] bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#374151]">VOL</span>
                               <span className="text-sm font-bold text-white font-mono">{formatMarketCap(token.volume_24h)}</span>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - User Info & SignIn */}
        <div className="flex min-w-0 flex-1 justify-end">
          <nav aria-label="Main" data-orientation="horizontal" dir="ltr" className="relative flex max-w-max flex-1 items-center justify-center">
            <div style={{ position: 'relative' }}>
              <ul data-orientation="horizontal" className="flex-1 list-none justify-center flex gap-2 items-stretch" dir="ltr">
                {authenticated && user?.wallet?.address && (
                  <li className="relative flex shrink-0 flex-col items-start justify-center h-12 rounded-xl border border-[rgba(255,255,255,.05)] px-3">
                    <button className="group inline-flex items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 focus:opacity-80 text-sm">
                      <div className="flex gap-3 items-baseline tabular-nums">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">$0.00</span>
                          <span className="text-[#6B7280] text-xs">cash</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">$0.00</span>
                          <span className="text-[#6B7280] text-xs">--</span>
                        </div>
                      </div>
                    </button>
                    <button type="button" className="text-[#6366F1] hover:text-[#818CF8] text-xs font-bold hover:opacity-80 transition-colors">
                      Deposit more
                    </button>
                  </li>
                )}
                <li className="relative flex items-center justify-center shrink-0 rounded-xl h-12 hover:bg-[#12121B] px-2 py-1 border border-[rgba(255,255,255,.05)] bg-[#09090F]">
                  <SignInButton />
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

function formatCompact(value: number): string {
  if (!value || value <= 0) return '0';
  if (value >= 1) return value.toFixed(value >= 100 ? 0 : 2);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toPrecision(2);
}

function formatMarketCap(value: number): string {
  if (!value || value <= 0) return '';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function shortenAddress(address?: string) {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
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
        <>
          $0.0<sub className="text-[10px] translate-y-[2px]">{zeroCount}</sub>{remaining}
        </>
      );
    }
  }
  return '$' + price.toPrecision(4);
}
