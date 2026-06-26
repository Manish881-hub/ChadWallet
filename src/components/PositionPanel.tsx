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
 * Shows the connected user's real on-chain position for the current token:
 * SOL balance, token balance, and their combined USD value.
 * PnL / trade history require an indexer (out of scope — no backend yet).
 * Unauthenticated → a sign-in prompt.
 */
export default function PositionPanel({ tokenMint, tokenSymbol, tokenPrice = 0, solPrice = 0 }: PositionPanelProps) {
  const { authenticated, user } = usePrivy();
  const [loginOpen, setLoginOpen] = useState(false);
  const { sol, token, loading } = useTokenBalances(tokenMint);

  if (!authenticated) {
    return (
      <div className="flex flex-col gap-2.5 p-3">
        <h3 className="text-[11px] font-mono font-bold text-[#A0A0A0] uppercase tracking-wider">Position</h3>
        <div className="flex flex-col items-center gap-2 py-3 px-3 rounded-lg border border-dashed border-[#1F1F1F] bg-[#0A0A0A]">
          <span className="text-[10px] font-mono text-[#A0A0A0] text-center">
            Sign in to see your balances & position
          </span>
          <button
            onClick={() => setLoginOpen(true)}
            className="mt-1 px-4 py-1.5 rounded-md bg-[#00C853] text-[#0A0A0A] text-[11px] font-mono font-bold hover:bg-[#00E05A] transition-colors"
          >
            Sign in
          </button>
        </div>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  const solUsd = sol * solPrice;
  const tokenUsd = token * tokenPrice;
  const totalUsd = solUsd + tokenUsd;

  return (
    <div className="flex flex-col gap-2 p-3 border-b border-[#1F1F1F]">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-mono font-bold text-[#A0A0A0] uppercase tracking-wider">Position</h3>
        {loading && (
          <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
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
          <span className="text-[9px] font-mono text-[#555] tabular-nums">{formatUsd(solUsd)}</span>
        </div>
      </div>

      {/* Token row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#A0A0A0]">{tokenSymbol}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-white tabular-nums">
            {token >= 1 ? token.toLocaleString(undefined, { maximumFractionDigits: 2 }) : token.toFixed(4)}
          </span>
          <span className="text-[9px] font-mono text-[#555] tabular-nums">{formatUsd(tokenUsd)}</span>
        </div>
      </div>

      {/* Wallet address */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1F1F1F]">
        <span className="text-[9px] font-mono text-[#555]">Wallet</span>
        {user?.wallet?.address ? (
          <a
            href={`https://solscan.io/account/${user.wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors tabular-nums"
          >
            {user.wallet.address.slice(0, 4)}…{user.wallet.address.slice(-4)} ↗
          </a>
        ) : (
          <span className="text-[9px] font-mono text-[#555]">—</span>
        )}
      </div>
    </div>
  );
}
