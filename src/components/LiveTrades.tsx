'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchTokenTrades } from '@/lib/birdeye';

interface LiveTradesProps {
  address: string;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toFixed(9);
}

export default function LiveTrades({ address }: LiveTradesProps) {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadTrades = useCallback(async () => {
    try {
      const data = await fetchTokenTrades(address, 50);
      if (data && data.length > 0) {
        setTrades(data);
        setError(null);
      } else if (trades.length === 0) {
        setError('No trades found');
      }
    } catch (err) {
      console.error('Trades fetch error:', err);
      setError('Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [address, trades.length]);

  useEffect(() => {
    loadTrades();

    // Auto-refresh every 5 seconds
    timerRef.current = setInterval(loadTrades, 5_000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadTrades]);

  return (
    <div className="flex flex-col bg-[#111111] rounded-xl border border-[#1F1F1F] h-full min-h-[300px] md:min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Live Trades</h3>
          <div className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
        </div>
        <span className="text-xs text-[#A0A0A0] font-mono tabular-nums">
          {trades.length} trades
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 text-[10px] text-[#A0A0A0] font-mono uppercase tracking-wider border-b border-[#1F1F1F]/50">
        <span>Time</span>
        <span>Type</span>
        <span className="text-right">USD</span>
        <span className="text-right">Price</span>
        <span className="text-right">Tx</span>
      </div>

      {/* Trades list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-32">
            <span className="text-[#A0A0A0] text-xs font-mono">{error}</span>
          </div>
        )}

        {!loading && !error && trades.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <span className="text-[#A0A0A0] text-xs font-mono">No trades yet</span>
          </div>
        )}

        {!loading &&
          trades.map((trade, i) => {
            const txHash = trade.txHash || trade.tx_hash || trade.signature || '';
            const isBuy = (trade.side || trade.type || '').toLowerCase() !== 'sell';
            const tradeAmount = parseFloat(trade.amountUsd || trade.amount_usd || trade.volumeUsd || trade.volume_usd || 0);
            const tradePrice = parseFloat(trade.price || trade.tokenPrice || trade.token_price || 0);
            const blockTime = trade.blockTime || trade.block_time || trade.unixTime || Math.floor(Date.now() / 1000) - (i * 30);

            return (
              <div
                key={txHash || `trade-${i}`}
                className={`grid grid-cols-5 gap-2 px-4 py-2.5 text-xs font-mono tabular-nums border-b border-[#1F1F1F]/30 transition-colors hover:bg-white/[0.02] ${
                  i === 0 ? 'animate-fade-up' : ''
                }`}
              >
                {/* Time */}
                <span className="text-[#A0A0A0]">
                  {timeAgo(blockTime)}
                </span>

                {/* Type */}
                <span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isBuy
                        ? 'bg-[#00C853]/15 text-[#00C853]'
                        : 'bg-[#FF1744]/15 text-[#FF1744]'
                    }`}
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </span>
                </span>

                {/* USD Amount */}
                <span className="text-right text-white font-medium">
                  {formatUSD(tradeAmount)}
                </span>

                {/* Price */}
                <span className="text-right text-[#A0A0A0]">
                  {tradePrice > 0 ? formatPrice(tradePrice) : '—'}
                </span>

                {/* Tx Link */}
                <span className="text-right">
                  {txHash ? (
                    <a
                      href={`https://solscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#39FF14]/60 hover:text-[#39FF14] transition-colors"
                      title="View on Solscan"
                    >
                      ↗
                    </a>
                  ) : (
                    <span className="text-[#1F1F1F]">—</span>
                  )}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
