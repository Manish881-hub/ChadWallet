'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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

export default function TradePage() {
  const { address } = useParams<{ address: string }>();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    setLoading(true);
    setTokenInfo(null);
    fetchTokenOverview(address)
      .then((info) => {
        setTokenInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load token:', err);
        setTokenInfo(null);
        setLoading(false);
      });
  }, [address]);

  // Fetch SOL price once for the position panel.
  useEffect(() => {
    fetchTokenOverview(SOL_MINT)
      .then((info) => { if (info?.price) setSolPrice(info.price); })
      .catch(() => {});
  }, []);

  if (loading || !tokenInfo) return <Skeleton />;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <TokenBanner position="top" />
      <TradeHeader />

      <div className="flex-1 flex min-h-0">
        {/* Left — Activity sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] min-w-[260px] border-r border-[#1F1F1F] bg-[#0A0A0A]">
          <ActivitySidebar current={address} />
        </aside>

        {/* Center — Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin min-w-0 p-2.5 pb-10 gap-2.5">
          <TokenHeader token={tokenInfo} />
          {/* Chart */}
          <div className="h-[280px] md:h-[340px] bg-[#111111] rounded-lg border border-[#1F1F1F] overflow-hidden">
            <TokenChart address={address} />
          </div>
          {/* Tab section: Trades + Holders */}
          <TabSection address={address} />
        </div>

        {/* Right — Position + Swap */}
        <aside className="hidden md:flex flex-col w-[280px] min-w-[280px] border-l border-[#1F1F1F] bg-[#111111]">
          <PositionPanel
            tokenMint={address}
            tokenSymbol={tokenInfo.symbol}
            tokenPrice={tokenInfo.price}
            solPrice={solPrice}
          />
          <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} tokenPrice={tokenInfo.price} />
        </aside>
      </div>

      {/* Mobile swap dock */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-40 bg-[#111111] border-t border-[#1F1F1F] p-3 max-h-[55vh] overflow-y-auto rounded-t-lg">
        <PositionPanel
          tokenMint={address}
          tokenSymbol={tokenInfo.symbol}
          tokenPrice={tokenInfo.price}
          solPrice={solPrice}
        />
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} tokenPrice={tokenInfo.price} />
      </div>

      <TokenBanner position="bottom" />
      <TradeFooter />
    </div>
  );
}

type ContentTab = 'Trades' | 'Holders';

function TabSection({ address }: { address: string }) {
  const [tab, setTab] = useState<ContentTab>('Trades');

  return (
    <div className="flex flex-col bg-[#111111] rounded-lg border border-[#1F1F1F] overflow-hidden flex-1 min-h-[200px]">
      {/* Tabs */}
      <div className="flex border-b border-[#1F1F1F]">
        <button
          onClick={() => setTab('Trades')}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
            tab === 'Trades'
              ? 'text-white border-b-2 border-[#39FF14]'
              : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          Trades
        </button>
        <button
          onClick={() => setTab('Holders')}
          className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
            tab === 'Holders'
              ? 'text-white border-b-2 border-[#39FF14]'
              : 'text-[#A0A0A0] hover:text-white'
          }`}
        >
          Holders
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'Trades' ? (
          <LiveTrades address={address} />
        ) : (
          <HoldersTable address={address} />
        )}
      </div>
    </div>
  );
}
