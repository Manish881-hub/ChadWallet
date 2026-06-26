'use client';
import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useTokenBalances } from '@/lib/useTokenBalances';
import LoginModal from './LoginModal';

type SwapsTab = 'All swaps' | 'Buys' | 'Sells';
type PositionsTab = 'Recent' | 'Open' | 'Closed';
type Timeframe = '24H' | '7D' | '30D' | 'ALL';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function ProfileContent() {
  const { user, authenticated, logout } = usePrivy();
  const [swapsTab, setSwapsTab] = useState<SwapsTab>('All swaps');
  const [positionsTab, setPositionsTab] = useState<PositionsTab>('Closed');
  const [loginOpen, setLoginOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');

  // We fetch SOL balance as a demo of real cash balance
  const { sol } = useTokenBalances(SOL_MINT);

  // Use real wallet if authenticated, else use mockup handle
  const displayName = authenticated && user?.wallet?.address
    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
    : 'StaleFreshMacaw';
  
  const displayHandle = authenticated && user?.wallet?.address
    ? `@${user.wallet.address.slice(0, 6)}`
    : '@StaleFreshMacaw';

  const avatarChar = authenticated && user?.wallet?.address
    ? user.wallet.address.slice(0, 2).toUpperCase()
    : null;

  return (
    <div className="flex flex-col flex-1 px-4 py-6 md:px-8 max-w-5xl mx-auto w-full gap-6">
      
      {/* Top Section - Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FF4D4D] to-[#FF8080] flex items-center justify-center overflow-hidden shrink-0">
             {avatarChar ? (
               <span className="text-2xl font-bold text-white">{avatarChar}</span>
             ) : (
               <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
               </svg>
             )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{displayName}</h1>
            <span className="text-[#A0A0A0] text-sm">{displayHandle}</span>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-baseline gap-1 text-[11px]">
                <svg className="w-3.5 h-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[#A0A0A0]">No hold time</span>
              </div>
              <div className="flex items-baseline gap-1 text-[11px]">
                <svg className="w-3.5 h-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                <span className="text-[#A0A0A0]">0 trades</span>
              </div>
              <div className="flex items-baseline gap-1 text-[11px]">
                <svg className="w-3.5 h-3.5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[#A0A0A0]">Joined Jun 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none">0</span>
              <span className="text-[11px] text-[#A0A0A0]">Following</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none">0</span>
              <span className="text-[11px] text-[#A0A0A0]">Followers</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!authenticated ? (
              <button onClick={() => setLoginOpen(true)} className="px-4 py-2 border border-[#1F1F1F] bg-[#111111] hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">
                Log In
              </button>
            ) : (
              <button onClick={() => logout()} className="px-4 py-2 border border-[#1F1F1F] bg-[#111111] hover:bg-[#FF1744]/10 hover:text-[#FF1744] hover:border-[#FF1744]/30 rounded-lg text-sm font-semibold transition-colors">
                Sign Out
              </button>
            )}
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="w-9 h-9 flex items-center justify-center border border-[#1F1F1F] bg-[#111111] hover:bg-white/5 rounded-lg transition-colors"
              title="Copy profile link"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12"/><path d="M19 8c-2 0-3.5-1.5-3.5-3.5S17 1 19 1s3.5 1.5 3.5 3.5S21 8 19 8z"/><path d="M5 8c2 0 3.5-1.5 3.5-3.5S7 1 5 1 1.5 2.5 1.5 4.5 3 8 5 8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[400px]">
        {/* Left column: Cash Balance and Positions */}
        <div className="flex flex-col flex-1 min-w-[300px] gap-4">
          
          {/* Cash Balance Card */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 flex flex-col h-[200px] relative">
            <div className="absolute top-4 right-4 flex gap-1">
              {(['24H', '7D', '30D', 'ALL'] as Timeframe[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded ${timeframe === t ? 'bg-white/10 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white tabular-nums">${sol > 0 ? (sol * 150).toFixed(2) : '0.00'}</h2>
            <span className="text-[#00C853] text-sm font-bold mt-1">+$0 24h</span>
            
            {/* Chart line mock */}
            <div className="flex-1 w-full flex items-center justify-center mt-4">
               <div className="w-full h-0.5 bg-[#00C853] relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#00C853]/20 to-transparent blur-[8px]" />
               </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1F1F1F]">
               <div className="flex-1 flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] font-bold">$</div>
                 <div className="flex flex-col leading-tight">
                   <span className="text-[10px] text-[#A0A0A0]">Cash balance</span>
                   <span className="text-[13px] font-bold text-white tabular-nums">${sol > 0 ? (sol * 150).toFixed(2) : '0'}</span>
                 </div>
               </div>
               <button
                  onClick={() => alert('Withdraw functionality coming soon')}
                  className="px-4 py-2 border border-[#1F1F1F] hover:bg-white/5 text-[12px] font-semibold rounded-lg transition-colors"
                >
                  Withdraw
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-deposit-modal'))}
                  className="px-4 py-2 bg-[#4D62FF] hover:bg-[#3D52E5] text-white text-[12px] font-semibold rounded-lg transition-colors"
                >
                  Deposit
                </button>
            </div>
          </div>

          {/* Positions Card */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl flex-1 flex flex-col overflow-hidden">
             <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F1F1F]">
                <span className="text-[13px] font-bold text-white">Your positions</span>
                <div className="flex gap-2">
                  {['Recent', 'Open', 'Closed'].map(t => (
                    <button key={t} onClick={() => setPositionsTab(t as PositionsTab)} className={`text-[11px] font-semibold flex items-center gap-1 ${positionsTab === t ? 'text-white' : 'text-[#9CA3AF] hover:text-[#A0A0A0]'}`}>
                      {positionsTab === t && <span className="w-1 h-3 bg-white/20 rounded-full" />}
                      {t}
                    </button>
                  ))}
                </div>
             </div>
             
             <div className="flex items-center px-4 py-2 border-b border-[#1F1F1F]/50">
                <span className="text-[11px] text-[#9CA3AF] font-mono flex-1">Token</span>
                <span className="text-[11px] text-[#9CA3AF] font-mono">PnL</span>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
                <span className="text-sm font-mono text-[#888]">No closed positions</span>
             </div>
          </div>
        </div>

        {/* Right column: Swaps */}
        <div className="flex flex-col flex-1 min-w-[300px]">
           <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1F1F1F]">
                {(['All swaps', 'Buys', 'Sells'] as SwapsTab[]).map(t => (
                  <button key={t} onClick={() => setSwapsTab(t)} className={`text-[13px] font-bold transition-colors ${swapsTab === t ? 'text-white' : 'text-[#9CA3AF] hover:text-[#A0A0A0]'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center px-4 py-2 border-b border-[#1F1F1F]/50">
                 <span className="text-[11px] text-[#9CA3AF] font-mono w-24">Token</span>
                 <span className="text-[11px] text-[#9CA3AF] font-mono w-16">Action</span>
                 <span className="text-[11px] text-[#9CA3AF] font-mono flex-1 text-right">Amount</span>
                 <span className="text-[11px] text-[#9CA3AF] font-mono flex-1 text-right flex items-center justify-end gap-1">MCap <span className="text-[8px]">▼</span></span>
                 <span className="text-[11px] text-[#9CA3AF] font-mono w-16 text-right">Time</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
                <span className="text-sm font-mono text-[#888]">No trades yet</span>
              </div>
           </div>
        </div>
      </div>
      
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
