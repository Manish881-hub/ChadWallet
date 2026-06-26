'use client';
import { useState } from 'react';
import { useTokenBalances } from '@/lib/useTokenBalances';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '@/lib/ProfileContext';
import LoginModal from '@/components/LoginModal';
import DepositModal from '@/components/modals/DepositModal';
import WithdrawModal from '@/components/modals/WithdrawModal';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const SOL_PRICE = 150; // In a real app, fetch from context/birdeye

export default function PortfolioSection() {
  const { authenticated } = usePrivy();
  const { profile } = useProfile();
  const { sol, loading } = useTokenBalances(SOL_MINT);
  const [timeframe, setTimeframe] = useState('24H');
  const [loginOpen, setLoginOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const portfolioValue = sol * SOL_PRICE;
  
  // Fake chart paths based on timeframe
  const charts = {
    '24H': 'M0,100 C20,80 30,90 50,50 C70,10 80,30 100,0',
    '7D': 'M0,100 C10,95 20,70 40,80 C60,90 70,20 100,0',
    '30D': 'M0,100 C30,100 40,40 60,60 C80,80 90,10 100,0',
    'ALL': 'M0,100 C10,90 30,90 50,60 C70,30 80,50 100,0',
  };
  
  const currentPath = charts[timeframe as keyof typeof charts] + ' L100,100 Z';

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 flex flex-col h-[280px] relative w-full overflow-hidden">
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex gap-1 z-10">
        {['24H', '7D', '30D', 'ALL'].map(t => (
          <button 
            key={t} 
            onClick={() => setTimeframe(t)}
            className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-colors ${timeframe === t ? 'bg-white/10 text-white' : 'text-[#9CA3AF] hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>
      
      {/* Value */}
      <div className="flex flex-col relative z-10">
        {!authenticated ? (
          <>
            <h2 className="text-3xl font-bold text-white tabular-nums blur-[4px] select-none">$0.00</h2>
            <span className="text-[#00C853] text-sm font-bold mt-1 blur-[2px] select-none">+$0 24h</span>
          </>
        ) : loading ? (
          <>
            <div className="h-9 w-32 skeleton rounded mt-1 mb-2" />
            <div className="h-5 w-20 skeleton rounded" />
          </>
        ) : (
          <>
            <h2 className={`text-3xl font-bold text-white tabular-nums transition-all ${profile.blurBalances ? 'blur-md select-none' : ''}`}>
              ${portfolioValue > 0 ? portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </h2>
            <span className={`text-[#00C853] text-sm font-bold mt-1 transition-all ${profile.blurBalances ? 'blur-sm select-none' : ''}`}>
              +${(portfolioValue * 0.05).toFixed(2)} {timeframe.toLowerCase()}
            </span>
          </>
        )}
      </div>

      {/* Chart line mock */}
      <div className="flex-1 w-full flex items-center justify-center mt-4 relative z-0">
        <div className="w-full h-full relative">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path 
               d={currentPath} 
               fill="url(#chart-grad)" 
               stroke="#00C853" 
               strokeWidth="1.5" 
               vectorEffect="non-scaling-stroke"
               className="transition-all duration-500 ease-in-out"
             />
             <defs>
               <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#00C853" stopOpacity="0.3" />
                 <stop offset="100%" stopColor="transparent" stopOpacity="0" />
               </linearGradient>
             </defs>
          </svg>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1F1F1F] z-10">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-[11px] font-bold">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-[#A0A0A0]">Cash balance</span>
            <span className={`text-[13px] font-bold text-white tabular-nums transition-all ${profile.blurBalances ? 'blur-sm select-none' : ''}`}>
              {!authenticated ? '---' : loading ? '...' : `$${portfolioValue > 0 ? portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}`}
            </span>
          </div>
        </div>

        {!authenticated ? (
          <button 
            onClick={() => setLoginOpen(true)}
            className="w-full max-w-[200px] py-2 bg-[#4D62FF] hover:bg-[#3D52E5] text-white text-[12px] font-semibold rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <button onClick={() => setWithdrawOpen(true)} className="px-4 py-2 border border-[#1F1F1F] hover:bg-white/5 text-[12px] font-semibold rounded-lg transition-colors">
              Withdraw
            </button>
            <button onClick={() => setDepositOpen(true)} className="px-4 py-2 bg-[#4D62FF] hover:bg-[#3D52E5] text-white text-[12px] font-semibold rounded-lg transition-colors">
              Deposit
            </button>
          </>
        )}
      </div>
      
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}
