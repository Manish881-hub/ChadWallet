'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TrendingList from '@/components/TrendingList';
import TokenChart from '@/components/TokenChart';
import LiveTrades from '@/components/LiveTrades';
import SwapWidget from '@/components/SwapWidget';
import { fetchTokenOverview } from '@/lib/birdeye';

export default function TradePage() {
  const { address } = useParams<{ address: string }>();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    fetchTokenOverview(address).then(setTokenInfo);
  }, [address]);

  if (!tokenInfo) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050816] text-white">
      {/* Left sidebar — Trending
          Mobile: horizontal scroll strip
          Tablet/Desktop: vertical rail */}
      <aside className="order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10 p-3 md:p-4 md:w-64 md:overflow-y-auto md:shrink-0">
        <TrendingList current={address} />
      </aside>

      {/* Main content */}
      <div className="order-1 md:order-2 flex-1 flex flex-col overflow-y-auto p-4 pb-32 md:pb-4 min-w-0">
        <div className="flex items-center gap-3 mb-6">
          {tokenInfo.logo_uri && (
            <img src={tokenInfo.logo_uri} alt={tokenInfo.symbol} className="w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-black truncate">{tokenInfo.symbol}</h1>
            <p className="text-gray-400 text-sm truncate">{tokenInfo.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 text-sm md:text-base">
          <div>Price: ${tokenInfo.price?.toFixed(6)}</div>
          <div>Market Cap: ${(tokenInfo.market_cap / 1e6).toFixed(1)}M</div>
          <div>Holders: {tokenInfo.holder}</div>
        </div>

        {/* Chart + Live trades side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <div className="lg:col-span-2">
            <TokenChart address={address} />
          </div>
          <div className="hidden lg:block">
            <LiveTrades address={address} />
          </div>
        </div>

        {/* Live trades full-width on tablet/mobile */}
        <div className="mt-4 lg:hidden">
          <LiveTrades address={address} />
        </div>
      </div>

      {/* Right sidebar — Swap
          Mobile/tablet: fixed bottom dock
          Desktop: right rail */}
      <aside className="order-3 md:order-3 md:w-80 md:border-l border-white/10 md:p-4 md:flex md:flex-col md:shrink-0 hidden md:block">
        <h2 className="text-xl font-bold mb-4">Your Position</h2>
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} />
      </aside>

      {/* Mobile swap dock — fixed at bottom */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0D1A] border-t border-white/10 p-4">
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} />
      </div>
    </div>
  );
}
