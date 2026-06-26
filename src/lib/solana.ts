// Solana RPC & wallet helpers
import { Connection, PublicKey } from "@solana/web3.js";
import { logger } from "./logger";

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_RPC!;

export const connection = new Connection(RPC_ENDPOINT, "confirmed");

export interface TokenHolder {
  address: string;
  amount: number;        // raw token amount (already human-readable)
  percentage: number;    // share of total supply, 0–100
}

/**
 * Fetch the largest on-chain holders of a token mint.
 * Uses `getTokenLargestAccounts` (RPC) for the top 20 accounts + the total
 * supply to compute each account's share. No PnL / avg-entry / hold-time —
 * those require an indexer and can't be read from RPC.
 *
 * Note: wrapped/native SOL mints (e.g. So111…) return system-program-style
 * accounts that have no SPL token accounts; callers should handle an empty
 * result gracefully.
 */
export async function getTokenHolders(mint: string, limit = 20): Promise<TokenHolder[]> {
  try {
    const mintKey = new PublicKey(mint);
    const [largest, supplyRes] = await Promise.all([
      connection.getTokenLargestAccounts(mintKey),
      connection.getTokenSupply(mintKey),
    ]);

    const decimals = supplyRes.value.decimals || 0;
    const total = supplyRes.value.uiAmount || 0;
    if (!largest.value || largest.value.length === 0) return [];

    return largest.value.slice(0, limit).map((acc) => {
      const amount = acc.uiAmount ?? 0;
      return {
        address: acc.address.toBase58(),
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });
  } catch (err: any) {
    logger.error('getTokenHolders failed', { mint, error: err?.message });
    return [];
  }
}
