'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from './logger';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_RPC!;
// Reuse a single connection across hook instances.
let _connection: Connection | null = null;
function getConnection() {
  if (!_connection) _connection = new Connection(RPC_ENDPOINT, 'confirmed');
  return _connection;
}

export interface TokenBalances {
  sol: number;            // SOL balance (human-readable, in SOL)
  token: number;          // SPL token balance (human-readable, in token units)
  walletAddress: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Reads the authenticated user's real on-chain balances for a given token mint.
 * Returns SOL balance + the SPL token balance for `tokenMint`.
 * For unauthenticated users returns zeros.
 *
 * Pass a `refreshSignal` (any changing value) to re-fetch — e.g. bump it after
 * a swap completes.
 */
export function useTokenBalances(tokenMint: string, refreshSignal?: unknown): TokenBalances {
  const { wallets } = useWallets();
  const wallet = wallets.find((w) => w.walletClientType === 'privy');

  const [sol, setSol] = useState(0);
  const [token, setToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async (address: string, mint: string) => {
    setLoading(true);
    setError(null);
    try {
      const conn = getConnection();
      const pubkey = new PublicKey(address);
      const lamports = await conn.getBalance(pubkey);
      setSol(lamports / 1e9);
      try {
        const accounts = await conn.getParsedTokenAccountsByOwner(pubkey, { mint: new PublicKey(mint) });
        const bal = accounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0;
        setToken(bal);
      } catch {
        // Native / unsupported mint → no token account.
        setToken(0);
      }
    } catch (err: any) {
      logger.error('useTokenBalances error', { error: err?.message });
      setError(err?.message ?? 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!wallet?.address) {
      setSol(0);
      setToken(0);
      setLoading(false);
      return;
    }
    fetchBalances(wallet.address, tokenMint);
  }, [wallet?.address, tokenMint, fetchBalances, refreshSignal]);

  return {
    sol,
    token,
    walletAddress: wallet?.address ?? null,
    loading,
    error,
  };
}
