'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useTokenBalances } from '@/lib/useTokenBalances';
import LoginModal from './LoginModal';

interface PositionPanelProps {
  tokenMint: string;
  tokenSymbol: string;
  tokenPrice?: number;     // USD price of the token
  solPrice?: number;       // USD price of SOL
}

function formatUsd(n: number): string {
  if (!n || n <= 0) return '$0.00';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

/**
 * Shows the connected user's real on-chain position for the current token.
 * Only visible when authenticated AND has a position (token balance > 0).
 * Compact single-section layout that integrates into the right sidebar.
 */
export default function PositionPanel({ tokenMint, tokenSymbol, tokenPrice = 0, solPrice = 0 }: PositionPanelProps) {
  const { authenticated, user } = usePrivy();
  const [loginOpen, setLoginOpen] = useState(false);
  const { sol, token, loading } = useTokenBalances(tokenMint);

  // Not authenticated — don't render (sign-in is handled by SwapWidget CTA)
  if (!authenticated) return null;

  // Loading state — show skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-3 border-b border-[#1F1F1F]">
        <div className="h-3 w-16 skeleton rounded" />
        <div className="flex justify-between">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
      </div>
    );
  }

  // No position — don't show the panel
  if (token <= 0 && sol <= 0) return null;

  const solUsd = sol * solPrice;
  const tokenUsd = token * tokenPrice;
  const totalUsd = solUsd + tokenUsd;

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-[#1F1F1F]">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-mono font-bold text-[#A0A0A0] uppercase tracking-wider">Position</h3>
        {user?.wallet?.address && (
          <a
            href={`https://solscan.io/account/${user.wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors tabular-nums"
          >
            {user.wallet.address.slice(0, 4)}…{user.wallet.address.slice(-4)} ↗
          </a>
        )}
      </div>

      {/* Total value */}
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-mono text-[#A0A0A0]">Total value</span>
        <span className="text-sm font-mono font-bold text-white tabular-nums">{formatUsd(totalUsd)}</span>
      </div>

      {/* SOL row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#A0A0A0]">SOL</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-white tabular-nums">{sol.toFixed(4)}</span>
          <span className="text-[9px] font-mono text-[#888] tabular-nums">{formatUsd(solUsd)}</span>
        </div>
      </div>

      {/* Token row */}
      {token > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#A0A0A0]">{tokenSymbol}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-white tabular-nums">
              {token >= 1 ? token.toLocaleString(undefined, { maximumFractionDigits: 2 }) : token.toFixed(4)}
            </span>
            <span className="text-[9px] font-mono text-[#888] tabular-nums">{formatUsd(tokenUsd)}</span>
          </div>
        </div>
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
