'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import TradeHeader from '@/components/TradeHeader';
import ActivitySidebar from '@/components/ActivitySidebar';
import TokenHeader from '@/components/TokenHeader';
import TokenChart from '@/components/TokenChart';
import LiveTrades from '@/components/LiveTrades';
import HoldersTable from '@/components/HoldersTable';
import SwapWidget from '@/components/SwapWidget';
import PositionPanel from '@/components/PositionPanel';
import TokenAboutPanel from '@/components/TokenAboutPanel';
import { TokenProvider, SidebarProvider, useSelectedToken } from '@/lib/TokenContext';
import { fetchTokenOverview } from '@/lib/birdeye';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

function Skeleton() {
  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      <TradeHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-3 items-center">
          <div className="w-6 h-6 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#A0A0A0]">Loading token...</span>
        </div>
      </div>
    </div>
  );
}

function TradePageInner() {
  const { address } = useParams<{ address: string }>();
  const { selectedToken, selectToken, loading: tokenLoading, error } = useSelectedToken();
  const [solPrice, setSolPrice] = useState(0);
  const initDone = useRef(false);

  // Initialize the token context with the URL address on mount
  useEffect(() => {
    if (address) {
      selectToken(address);
      initDone.current = true;
    }
  }, [address, selectToken]);

  // Fetch SOL price once
  useEffect(() => {
    fetchTokenOverview(SOL_MINT)
      .then((info) => { if (info?.price) setSolPrice(info.price); })
      .catch(() => {});
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/\/trade\/(.+)/);
      if (match && match[1]) {
        selectToken(match[1]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectToken]);

  if (tokenLoading) return <Skeleton />;

  if (error || !selectedToken) {
    return (
      <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
        <TradeHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[#FF1744] text-sm font-mono">{error || 'Token not found'}</span>
            <button
              onClick={() => selectToken(address!)}
              className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <TradeHeader />

      <div className="flex-1 flex min-h-0">
        {/* Left — Collapsible Activity sidebar */}
        <ActivitySidebar />

        {/* Center — Main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Token header */}
          <div className="px-3 pt-2.5 pb-1">
            <TokenHeader token={selectedToken} />
          </div>

          {/* Chart — fills available vertical space */}
          <div className="flex-1 min-h-0 px-3 pb-1">
            <TokenChart address={selectedToken.address} />
          </div>

          {/* Tab section: Trades / Holders / Swaps / Thesis */}
          <div className="px-3 pb-2.5">
            <TabSection address={selectedToken.address} />
          </div>
        </div>

        {/* Right — Position + Swap + About */}
        <aside className="hidden md:flex flex-col w-[320px] min-w-[320px] border-l border-[#1F1F1F] bg-[#111111] overflow-y-auto scrollbar-thin">
          <PositionPanel
            tokenMint={selectedToken.address}
            tokenSymbol={selectedToken.symbol}
            tokenPrice={selectedToken.price}
            solPrice={solPrice}
          />
          <SwapWidget
            tokenMint={selectedToken.address}
            tokenSymbol={selectedToken.symbol}
            tokenPrice={selectedToken.price}
            marketCap={selectedToken.market_cap}
          />
          <div className="border-t border-[#1F1F1F]">
            <TokenAboutPanel
              tokenSymbol={selectedToken.symbol}
              tokenName={selectedToken.name}
              price_change_5m_percent={selectedToken.price_change_5m_percent}
              price_change_1h_percent={selectedToken.price_change_1h_percent}
              price_change_4h_percent={selectedToken.price_change_4h_percent}
              price_change_24h_percent={selectedToken.price_change_24h_percent}
              market_cap={selectedToken.market_cap}
            />
          </div>
        </aside>
      </div>

      {/* Mobile swap dock */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#111111] border-t border-[#1F1F1F] max-h-[60vh] overflow-y-auto rounded-t-xl">
        <PositionPanel
          tokenMint={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
          tokenPrice={selectedToken.price}
          solPrice={solPrice}
        />
        <SwapWidget
          tokenMint={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
          tokenPrice={selectedToken.price}
          marketCap={selectedToken.market_cap}
        />
      </div>
    </div>
  );
}

type ContentTab = 'Trades' | 'Holders' | 'Swaps' | 'Thesis';

function TabSection({ address }: { address: string }) {
  const [tab, setTab] = useState<ContentTab>('Trades');
  const scrollPositions = useRef<Record<string, number>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const CONTENT_TABS: ContentTab[] = ['Trades', 'Holders', 'Swaps', 'Thesis'];

  // Keyboard navigation for tabs
  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const idx = CONTENT_TABS.indexOf(tab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = CONTENT_TABS[(idx + 1) % CONTENT_TABS.length];
      setTab(next);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = CONTENT_TABS[(idx - 1 + CONTENT_TABS.length) % CONTENT_TABS.length];
      setTab(prev);
    }
  }, [tab]);

  // Save scroll position when switching tabs
  const handleTabSwitch = (newTab: ContentTab) => {
    if (contentRef.current) {
      scrollPositions.current[tab] = contentRef.current.scrollTop;
    }
    setTab(newTab);
  };

  // Restore scroll position after tab switch
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPositions.current[tab] ?? 0;
    }
  }, [tab]);

  return (
    <div className="flex flex-col bg-[#111111] rounded-lg border border-[#1F1F1F] overflow-hidden min-h-[200px] max-h-[300px]">
      {/* Top tabs */}
      <div
        className="flex items-center border-b border-[#1F1F1F]"
        role="tablist"
        ref={tabsRef}
        onKeyDown={handleTabKeyDown}
      >
        {CONTENT_TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => handleTabSwitch(t)}
            className={`relative px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors press-scale ${
              tab === t
                ? 'text-white'
                : 'text-[#6B7280] hover:text-[#A0A0A0]'
            }`}
          >
            {t}
            {/* Active tab indicator — animated slide */}
            {tab === t && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#39FF14] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {tab === 'Trades' && <LiveTrades address={address} />}
        {tab === 'Holders' && <HoldersTable address={address} />}
        {tab === 'Swaps' && (
          <div className="flex flex-col items-center justify-center h-full py-8 gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 014-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 01-4 4H3" />
            </svg>
            <span className="text-[#555] text-xs font-mono">Connect wallet to view your swaps</span>
          </div>
        )}
        {tab === 'Thesis' && (
          <ThesisPanel address={address} />
        )}
      </div>
    </div>
  );
}

function ThesisPanel({ address }: { address: string }) {
  const [thesis, setThesis] = useState('');
  const [saved, setSaved] = useState(false);

  // Load saved thesis from localStorage
  useEffect(() => {
    const savedThesis = localStorage.getItem(`thesis:${address}`);
    if (savedThesis) setThesis(savedThesis);
  }, [address]);

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <textarea
        value={thesis}
        onChange={(e) => { setThesis(e.target.value); setSaved(false); }}
        placeholder="Write your thesis for this token... What's the catalyst? What's your entry/exit? Why this token?"
        className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-3 text-xs font-mono text-white placeholder:text-[#333] outline-none focus:border-[#39FF14]/30 resize-none min-h-[100px]"
      />
      <button
        onClick={() => {
          localStorage.setItem(`thesis:${address}`, thesis);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all press-scale ${
          saved ? 'bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30' : 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 hover:bg-[#39FF14]/20'
        }`}
      >
        {saved ? '✓ Saved' : 'Save Thesis'}
      </button>
    </div>
  );
}

export default function TradePage() {
  const { address } = useParams<{ address: string }>();

  return (
    <TokenProvider initialAddress={address}>
      <SidebarProvider>
        <TradePageInner />
      </SidebarProvider>
    </TokenProvider>
  );
}
