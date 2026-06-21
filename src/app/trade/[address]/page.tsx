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

  if (!tokenInfo) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <aside className="w-64 border-r border-gray-800 overflow-y-auto p-4">
        <TrendingList current={address} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <img src={tokenInfo.logo_uri} className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-3xl font-black">{tokenInfo.symbol}</h1>
            <p className="text-gray-400">{tokenInfo.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>Price: ${tokenInfo.price?.toFixed(6)}</div>
          <div>Market Cap: ${(tokenInfo.market_cap / 1e6).toFixed(1)}M</div>
          <div>Holders: {tokenInfo.holder}</div>
        </div>
        <TokenChart address={address} />
        <LiveTrades address={address} />
      </div>

      {/* Right sidebar */}
      <aside className="w-80 border-l border-gray-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Your Position</h2>
        <SwapWidget tokenMint={address} tokenSymbol={tokenInfo.symbol} />
      </aside>
    </div>
  );
}