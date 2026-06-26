'use client';
import { useState } from 'react';
import { MOCK_TRADES } from '@/lib/mock/profileData';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '@/lib/ProfileContext';

type SwapsTab = 'All swaps' | 'Buys' | 'Sells';

export default function TradesTable() {
  const { authenticated } = usePrivy();
  const { profile } = useProfile();
  const [tab, setTab] = useState<SwapsTab>('All swaps');

  const filteredTrades = MOCK_TRADES.filter(t => {
    if (tab === 'Buys') return t.action === 'Buy';
    if (tab === 'Sells') return t.action === 'Sell';
    return true;
  });

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl h-full flex flex-col overflow-hidden min-h-[300px]">
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1F1F1F]">
        {(['All swaps', 'Buys', 'Sells'] as SwapsTab[]).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`text-[13px] font-bold transition-colors relative ${tab === t ? 'text-white' : 'text-[#6B7280] hover:text-[#A0A0A0]'}`}
          >
            {t}
            {tab === t && (
              <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-white rounded-t-full" />
            )}
          </button>
        ))}
      </div>
      
      <div className="flex items-center px-4 py-2 border-b border-[#1F1F1F]/50">
         <span className="text-[11px] text-[#6B7280] font-mono w-[20%]">Token</span>
         <span className="text-[11px] text-[#6B7280] font-mono w-[15%]">Action</span>
         <span className="text-[11px] text-[#6B7280] font-mono w-[25%] text-right">Amount</span>
         <span className="text-[11px] text-[#6B7280] font-mono w-[20%] text-right">MCap</span>
         <span className="text-[11px] text-[#6B7280] font-mono w-[20%] text-right">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!authenticated ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50 p-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span className="text-sm font-mono text-[#555]">Connect wallet to view trades</span>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50 p-6">
            <span className="text-sm font-mono text-[#555]">No trades yet</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredTrades.map(trade => (
              <div key={trade.id} className="flex items-center px-4 py-2.5 border-b border-[#1F1F1F]/50 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="w-[20%] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                    {trade.token.slice(0, 1)}
                  </div>
                  <span className="text-xs font-bold text-white truncate">{trade.token}</span>
                </div>
                <div className="w-[15%]">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.action === 'Buy' ? 'text-[#00C853] bg-[#00C853]/10' : 'text-[#FF1744] bg-[#FF1744]/10'}`}>
                    {trade.action}
                  </span>
                </div>
                <div className="w-[25%] text-right flex flex-col">
                  <span className={`text-xs font-mono font-bold transition-all ${trade.action === 'Buy' ? 'text-[#00C853]' : 'text-white'} ${profile.blurBalances ? 'blur-sm select-none' : ''}`}>{trade.amount}</span>
                </div>
                <div className="w-[20%] text-right">
                  <span className="text-[11px] font-mono text-[#A0A0A0]">{trade.mcap}</span>
                </div>
                <div className="w-[20%] text-right flex items-center justify-end gap-2">
                  <span className="text-[11px] font-mono text-[#555] group-hover:text-[#A0A0A0] transition-colors">{trade.time}</span>
                  <svg className="w-3 h-3 text-[#333] group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
