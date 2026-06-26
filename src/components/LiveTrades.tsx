'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchTokenTrades } from '@/lib/birdeye';
import { logger } from '@/lib/logger';

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

  const isLoadingRef = useRef(false);

  const loadTrades = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const data = await fetchTokenTrades(address, 50);
      if (data && data.length > 0) {
        setTrades(data);
        setError(null);
      } else if (trades.length === 0) {
        setError('No trades found');
      }
    } catch (err) {
      logger.warn('Trades fetch error', { error: err });
      if (trades.length === 0) {
        setError('No trades available');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [address, trades.length]);

  useEffect(() => {
    loadTrades();

    // Auto-refresh every 30s (Birdeye free tier is rate-limited)
    const poll = () => {
      timerRef.current = setTimeout(async () => {
        await loadTrades();
        poll();
      }, 30_000);
    };
    poll();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadTrades]);

  return (
    <div className="flex flex-col bg-[#12121B] rounded-xl border border-[rgba(255,255,255,.05)] h-full min-h-[300px] md:min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,.05)]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Live Trades</h3>
          <div className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
        </div>
        <span className="text-xs text-[#A0A0A0] font-mono tabular-nums">
          {trades.length} trades
        </span>
      </div>

      {/* Trades table */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] text-[#A0A0A0] font-mono uppercase tracking-wider border-b border-[rgba(255,255,255,.05)]">
              <th className="px-4 py-2 text-left font-medium">Time</th>
              <th className="px-4 py-2 text-left font-medium">Type</th>
              <th className="px-4 py-2 text-right font-medium">USD</th>
              <th className="px-4 py-2 text-right font-medium">Price</th>
              <th className="px-4 py-2 text-right font-medium">Tx</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="w-5 h-5 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            )}

            {error && !loading && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <span className="text-[#A0A0A0] text-xs font-mono">{error}</span>
                </td>
              </tr>
            )}

            {!loading && !error && trades.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <span className="text-[#A0A0A0] text-xs font-mono">No trades yet</span>
                </td>
              </tr>
            )}

            {!loading &&
              trades.map((trade, i) => {
                const txHash = trade.txHash || trade.tx_hash || trade.signature || '';
                const isBuy = (trade.side || trade.type || '').toLowerCase() !== 'sell';
                const tradeAmount = parseFloat(trade.amountUsd || trade.amount_usd || trade.volumeUsd || trade.volume_usd || 0);
                const tradePrice = parseFloat(trade.price || trade.tokenPrice || trade.token_price || 0);
                const blockTime = trade.blockTime || trade.block_time || trade.unixTime || Math.floor(Date.now() / 1000) - (i * 30);

                return (
                  <tr
                    key={`${txHash || 'trade'}-${i}`}
                    className={`text-xs font-mono tabular-nums border-b border-[rgba(255,255,255,.03)] transition-colors hover:bg-white/[0.02] ${
                      i === 0 ? 'animate-fade-up' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 text-[#A0A0A0]">
                      {timeAgo(blockTime)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy
                            ? 'bg-[#00C853]/15 text-[#00C853]'
                            : 'bg-[#FF1744]/15 text-[#FF1744]'
                        }`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-white font-medium">
                      {formatUSD(tradeAmount)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-[#A0A0A0]">
                      {tradePrice > 0 ? formatPrice(tradePrice) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
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
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
