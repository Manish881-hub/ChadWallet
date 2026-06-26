'use client';

import { useState, useCallback } from 'react';

interface TokenHeaderProps {
  token: any;
}

function formatUSD(value: number): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPrice(value: number): string {
  if (!value || value <= 0) return '0.00';
  if (value >= 1) return value.toFixed(value >= 1000 ? 2 : 4);
  if (value >= 0.01) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toPrecision(3);
}

function formatCount(value: number): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function TokenHeader({ token }: TokenHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`bookmark:${token?.address}`) === 'true';
  });

  const change = token.price_change_24h_percent ?? 0;
  const positive = change >= 0;

  const handleCopy = useCallback(async () => {
    if (!token?.address) return;
    try {
      await navigator.clipboard.writeText(token.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = token.address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token?.address]);

  const handleBookmark = useCallback(() => {
    const next = !bookmarked;
    setBookmarked(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`bookmark:${token?.address}`, String(next));
    }
  }, [bookmarked, token?.address]);

  // Compact metrics strip data
  const metrics: { label: string; value: string }[] = [];
  if (token.market_cap) metrics.push({ label: 'MCap', value: formatUSD(token.market_cap) });
  if (token.liquidity) metrics.push({ label: 'Liq', value: formatUSD(token.liquidity) });
  if (token.volume_24h) metrics.push({ label: 'Vol 24h', value: formatUSD(token.volume_24h) });
  if (token.holder) metrics.push({ label: 'Holders', value: formatCount(token.holder) });

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1: Token identity + explorer links */}
      <div className="flex items-center gap-3">
        {/* Token avatar */}
        <button
          type="button"
          aria-label="View token image"
          className="relative shrink-0 press-scale"
          style={{ width: 40, height: 40 }}
        >
          {token.logo_uri ? (
            <img
              src={token.logo_uri}
              alt={token.symbol}
              className="rounded-full border border-[#2A2A2A] w-10 h-10 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#12121B] border border-[rgba(255,255,255,.05)] flex items-center justify-center text-xs font-mono text-[#A0A0A0]">
              {(token.symbol ?? '?').slice(0, 2)}
            </div>
          )}
        </button>

        {/* Symbol + price + change */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white leading-tight truncate">{token.symbol}</h1>
            {/* Solana chain badge */}
            <div
              className="rounded-full bg-[#12121B] flex items-center justify-center shrink-0 overflow-hidden"
              style={{ width: 20, height: 20 }}
              title="Solana"
            >
              <svg width="12" height="12" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.5 96.3c1-1 2.3-1.5 3.7-1.5h90.4c2.3 0 3.5 2.8 1.8 4.5l-17.9 17.9c-1 1-2.3 1.5-3.7 1.5H9.4c-2.3 0-3.5-2.8-1.8-4.5L25.5 96.3z" fill="url(#solana_a)"/>
                <path d="M25.5 10.8c1-1 2.3-1.5 3.7-1.5h90.4c2.3 0 3.5 2.8 1.8 4.5L103.5 31.7c-1 1-2.3 1.5-3.7 1.5H9.4c-2.3 0-3.5-2.8-1.8-4.5L25.5 10.8z" fill="url(#solana_b)"/>
                <path d="M103.5 53.3c-1-1-2.3-1.5-3.7-1.5H9.4c-2.3 0-3.5 2.8-1.8 4.5l17.9 17.9c1 1 2.3 1.5 3.7 1.5h90.4c2.3 0 3.5-2.8 1.8-4.5L103.5 53.3z" fill="url(#solana_c)"/>
                <defs>
                  <linearGradient id="solana_a" x1="94.8" y1="-3.6" x2="35.3" y2="136.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                  <linearGradient id="solana_b" x1="66.2" y1="-22.8" x2="6.7" y2="117.3" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                  <linearGradient id="solana_c" x1="80.3" y1="-13.3" x2="20.8" y2="126.8" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Price */}
            <span className="text-sm font-mono tabular-nums text-white ml-auto shrink-0">
              ${formatPrice(token.price)}
            </span>
            {/* 24h change badge */}
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tabular-nums shrink-0 ${
                positive ? 'bg-[#00C853]/15 text-[#00C853]' : 'bg-[#FF1744]/15 text-[#FF1744]'
              }`}
            >
              {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Name + contract address + action icons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A0A0A0] truncate max-w-[140px]" title={token.name}>
          {token.name}
        </span>
        <div className="w-px h-3 bg-[#1F1F1F]" />

        {/* Copy address button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:opacity-100 opacity-70 transition-opacity"
          aria-label="Copy address"
          title={token.address}
        >
          <span className="text-xs text-[#A0A0A0] font-mono tabular-nums">
            {truncateAddress(token.address)}
          </span>
          <div className={`w-4 h-4 shrink-0 relative flex items-center justify-center ${copied ? 'animate-copy-success' : ''}`}>
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-white transition-colors">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
          </div>
          {copied && (
            <span className="text-[9px] font-mono text-[#00C853] animate-slide-in">Copied!</span>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Explorer links */}
        <div className="flex items-center gap-1">
          {/* X/Twitter search */}
          <a
            href={`https://x.com/search?q=${token.symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-md w-7 h-7 bg-[#12121B] hover:bg-white/10 transition-colors"
            title={`Search ${token.symbol} on X`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </a>
          {/* Globe / website */}
          <a
            href={`https://solscan.io/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-md w-7 h-7 bg-[#12121B] hover:bg-white/10 transition-colors"
            title="View on Solscan"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </a>
          {/* Bookmark / star */}
          <button
            onClick={handleBookmark}
            className={`flex items-center justify-center rounded-md w-7 h-7 transition-colors press-scale ${
              bookmarked ? 'bg-[#39FF14]/15' : 'bg-[#12121B] hover:bg-white/10'
            }`}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark token'}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark token'}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill={bookmarked ? '#39FF14' : 'none'}
              stroke={bookmarked ? '#39FF14' : '#A0A0A0'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 3: Compact metrics strip */}
      {metrics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#12121B] border border-[rgba(255,255,255,.05)] shrink-0"
            >
              <span className="text-[9px] uppercase tracking-wider font-mono text-[#6B7280]">{m.label}</span>
              <span className="text-[11px] font-mono font-bold tabular-nums text-white">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
