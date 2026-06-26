'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TradeHeader from '@/components/TradeHeader';
import TradeFooter from '@/components/TradeFooter';
import TokenBanner from '@/components/TokenBanner';
import ActivitySidebar from '@/components/ActivitySidebar';
import TokenHeader from '@/components/TokenHeader';
import TokenChart from '@/components/TokenChart';
import LiveTrades from '@/components/LiveTrades';
import HoldersTable from '@/components/HoldersTable';
import SwapWidget from '@/components/SwapWidget';
import PositionPanel from '@/components/PositionPanel';
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
  const { selectedToken, selectToken, loading: tokenLoading } = useSelectedToken();
  const [solPrice, setSolPrice] = useState(0);

  // Initialize the token context with the URL address on mount
  useEffect(() => {
    if (address && address !== selectedToken?.address) {
      selectToken(address);
    }
  }, [address]);

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

  if (tokenLoading || !selectedToken) return <Skeleton />;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <TokenBanner position="top" />
      <TradeHeader />

      <div className="flex-1 flex min-h-0">
        {/* Left — Collapsible Activity sidebar */}
        <ActivitySidebar />

        {/* Center — Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin min-w-0 p-2.5 pb-10 gap-2.5">
          <TokenHeader token={selectedToken} />
          {/* Chart */}
          <div className="h-[280px] md:h-[340px] bg-[#111111] rounded-lg border border-[#1F1F1F] overflow-hidden">
            <TokenChart address={selectedToken.address} />
          </div>
          {/* Tab section: Trades / Holders / Swaps / Thesis */}
          <TabSection address={selectedToken.address} />
        </div>

        {/* Right — Position + Swap */}
        <aside className="hidden md:flex flex-col w-[280px] min-w-[280px] border-l border-[#1F1F1F] bg-[#111111]">
          <PositionPanel
            tokenMint={selectedToken.address}
            tokenSymbol={selectedToken.symbol}
            tokenPrice={selectedToken.price}
            solPrice={solPrice}
          />
          <SwapWidget tokenMint={selectedToken.address} tokenSymbol={selectedToken.symbol} tokenPrice={selectedToken.price} />
        </aside>
      </div>

      {/* Mobile swap dock */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-40 bg-[#111111] border-t border-[#1F1F1F] p-3 max-h-[55vh] overflow-y-auto rounded-t-lg">
        <PositionPanel
          tokenMint={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
          tokenPrice={selectedToken.price}
          solPrice={solPrice}
        />
        <SwapWidget tokenMint={selectedToken.address} tokenSymbol={selectedToken.symbol} tokenPrice={selectedToken.price} />
      </div>

      <TokenBanner position="bottom" />
      <TradeFooter />
    </div>
  );
}

type ContentTab = 'Trades' | 'Holders' | 'Swaps' | 'Thesis';
type TimeRange = '1D' | '1W' | '1M' | '3M';

function TabSection({ address }: { address: string }) {
  const [tab, setTab] = useState<ContentTab>('Trades');
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');

  const CONTENT_TABS: ContentTab[] = ['Trades', 'Holders', 'Swaps', 'Thesis'];
  const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M'];

  return (
    <div className="flex flex-col bg-[#111111] rounded-lg border border-[#1F1F1F] overflow-hidden flex-1 min-h-[200px]">
      {/* Top tabs */}
      <div className="flex items-center border-b border-[#1F1F1F]">
        <div className="flex">
          {CONTENT_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                tab === t
                  ? 'text-white border-b-2 border-[#39FF14]'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Time range selector */}
        <div className="ml-auto flex gap-0.5 mr-1">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded transition-colors ${
                timeRange === tr
                  ? 'text-[#39FF14] bg-[#39FF14]/10'
                  : 'text-[#555] hover:text-[#A0A0A0]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'Trades' && <LiveTrades address={address} />}
        {tab === 'Holders' && <HoldersTable address={address} />}
        {tab === 'Swaps' && (
          <div className="flex items-center justify-center h-full">
            <span className="text-[#555] text-xs font-mono">Swap history — connect wallet to view</span>
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
        className="flex-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-3 text-xs font-mono text-white placeholder:text-[#333] outline-none focus:border-[#39FF14]/30 resize-none"
      />
      <button
        onClick={() => {
          localStorage.setItem(`thesis:${address}`, thesis);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all ${
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
