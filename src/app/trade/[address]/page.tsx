'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TradeHeader from '@/components/TradeHeader';
import TradeFooter from '@/components/TradeFooter';
import TrendingList from '@/components/TrendingList';
import TokenHeader from '@/components/TokenHeader';
import TokenChart from '@/components/TokenChart';
import LiveTrades from '@/components/LiveTrades';
import HoldersTable from '@/components/HoldersTable';
import TokenAboutPanel from '@/components/TokenAboutPanel';
import SwapWidget from '@/components/SwapWidget';
import { fetchTokenOverview } from '@/lib/birdeye';

function Skeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090F] text-white">
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
    <div className="flex flex-col min-h-screen bg-[#09090F] text-white">
      <TradeHeader />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left — Trending rail */}
        <aside className="border-t md:border-t-0 md:border-r border-[rgba(255,255,255,.05)] md:w-[256px] md:min-w-[256px] md:overflow-y-auto md:shrink-0">
          <TrendingList current={address} />
        </aside>

        {/* Center — Main content */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 pb-36 md:pb-4 min-w-0 gap-4">
          <TokenHeader token={tokenInfo} />
          {/* Chart at ~45% height */}
          <div className="h-[300px] md:h-[350px]">
            <TokenChart address={address} />
          </div>
          {/* Holders table */}
          <HoldersTable />
          {/* Live trades */}
          <LiveTrades address={address} />
        </div>

        {/* Right — Swap widget + About panel in one unified card */}
        <aside className="hidden md:flex md:w-[320px] md:min-w-[320px] md:border-l border-[rgba(255,255,255,.05)] md:p-4 md:flex-col md:shrink-0 md:overflow-y-auto">
          <div className="flex flex-col bg-[#12121B] rounded-xl border border-[rgba(255,255,255,.05)]">
            <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} tokenPrice={tokenInfo.price} />
            <div className="mx-4 border-t border-[rgba(255,255,255,.05)]" />
            <div className="p-4">
              <TokenAboutPanel
                market_cap={tokenInfo.market_cap}
                price_change_24h_percent={tokenInfo.price_change_24h_percent}
                price_change_1h_percent={tokenInfo.price_change_1h_percent}
                price_change_6h_percent={tokenInfo.price_change_6h_percent}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile swap dock */}
      <div className="md:hidden fixed bottom-8 inset-x-0 z-40 bg-[#12121B] border-t border-[rgba(255,255,255,.05)] p-3 max-h-[60vh] overflow-y-auto">
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} tokenPrice={tokenInfo.price} />
      </div>
      <TradeFooter />
    </div>
  );
}
