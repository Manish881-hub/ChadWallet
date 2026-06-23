'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TradeHeader from '@/components/TradeHeader';
import TrendingList from '@/components/TrendingList';
import TokenHeader from '@/components/TokenHeader';
import TokenChart from '@/components/TokenChart';
import LiveTrades from '@/components/LiveTrades';
import SwapWidget from '@/components/SwapWidget';
import { fetchTokenOverview } from '@/lib/birdeye';

function Skeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white">
      <TradeHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-3 items-center">
          <div className="w-8 h-8 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
          <span className="text-sm font-mono text-[#A0A0A0]">Loading token...</span>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  const { address } = useParams<{ address: string }>();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTokenInfo(null);
    fetchTokenOverview(address).then((info) => {
      setTokenInfo(info);
      setLoading(false);
    });
  }, [address]);

  if (loading || !tokenInfo) return <Skeleton />;

  return (
    <div className="flex flex-col min-h-screen bg-[#050816] text-white">
      <TradeHeader />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left — Trending rail */}
        <aside className="border-t md:border-t-0 md:border-r border-white/10 md:w-[256px] md:min-w-[256px] md:overflow-y-auto md:shrink-0">
          <TrendingList current={address} />
        </aside>

        {/* Center — Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 pb-36 md:pb-4 min-w-0 gap-4">
          <TokenHeader token={tokenInfo} />
          <TokenChart address={address} />
          <LiveTrades address={address} />
        </div>

        {/* Right — Swap widget */}
        <aside className="hidden md:flex md:w-[320px] md:min-w-[320px] md:border-l border-white/10 md:p-4 md:flex-col md:shrink-0">
          <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} />
        </aside>
      </div>

      {/* Mobile swap dock */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0D1A] border-t border-white/10 p-3">
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} />
      </div>
    </div>
  );
}
