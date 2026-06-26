'use client';
import { useState } from 'react';
import { MOCK_POSITIONS } from '@/lib/mock/profileData';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '@/lib/ProfileContext';
import Link from 'next/link';

type PositionsTab = 'Recent' | 'Open' | 'Closed';

export default function PositionsTable() {
  const { authenticated } = usePrivy();
  const { profile } = useProfile();
  const [tab, setTab] = useState<PositionsTab>('Open');

  // We'll just show the mock data for 'Open', and empty for 'Closed'/'Recent' for realism
  const filteredPositions = tab === 'Open' ? MOCK_POSITIONS : [];

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl flex-1 flex flex-col overflow-hidden min-h-[300px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F]">
        <span className="text-[13px] font-bold text-white">Your positions</span>
        <div className="flex gap-2">
          {(['Recent', 'Open', 'Closed'] as PositionsTab[]).map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${tab === t ? 'text-white' : 'text-[#9CA3AF] hover:text-[#A0A0A0]'}`}
            >
              {tab === t && <span className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_rgba(57,255,20,0.5)]" />}
              {t}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center px-4 py-2 border-b border-[#1F1F1F]/50">
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[20%]">Token</span>
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[15%] text-right hidden sm:block">Avg Entry</span>
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[15%] text-right hidden sm:block">Current</span>
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[20%] text-right">PnL</span>
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[20%] text-right">Value</span>
        <span className="text-[11px] text-[#9CA3AF] font-mono w-[10%] text-right"></span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!authenticated ? (
           <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50 p-6">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             <span className="text-sm font-mono text-[#888]">Connect wallet to view positions</span>
           </div>
        ) : filteredPositions.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50 p-6">
             <span className="text-sm font-mono text-[#888]">No {tab.toLowerCase()} positions</span>
           </div>
        ) : (
          <div className="flex flex-col">
             {filteredPositions.map(pos => (
               <div key={pos.id} className="flex items-center px-4 py-2.5 border-b border-[#1F1F1F]/50 hover:bg-white/5 transition-colors group">
                 
                 {/* Token */}
                  <div className="w-[20%] flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                      {pos.token.slice(0, 1)}
                    </div>
                    <span className="text-xs font-bold text-white truncate">{pos.token}</span>
                  </div>

                  {/* Entry */}
                  <div className="w-[15%] text-right hidden sm:block">
                   <span className="text-[11px] font-mono text-[#A0A0A0]">{pos.avgEntry}</span>
                 </div>
                 
                 {/* Current */}
                 <div className="w-[15%] text-right hidden sm:block">
                   <span className="text-[11px] font-mono text-white">{pos.currentPrice}</span>
                 </div>
                 
                 {/* PnL */}
                 <div className={`w-[20%] text-right flex flex-col transition-all ${profile.blurBalances ? 'blur-sm select-none' : ''}`}>
                   <span className={`text-[12px] font-mono font-bold ${pos.positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>{pos.pnl}</span>
                   <span className={`text-[10px] font-mono ${pos.positive ? 'text-[#00C853]' : 'text-[#FF1744]'}`}>{pos.percent}</span>
                 </div>
                 
                 {/* Value */}
                 <div className="w-[20%] text-right">
                   <span className={`text-[12px] font-mono font-bold text-white transition-all ${profile.blurBalances ? 'blur-sm select-none' : ''}`}>{pos.value}</span>
                 </div>
                 
                 {/* Action */}
                  <div className="w-[10%] text-right flex justify-end">
                    <Link
                      href={`/trade/So11111111111111111111111111111111111111112`}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all inline-flex"
                      title="Trade"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                    </Link>
                  </div>
                 
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
