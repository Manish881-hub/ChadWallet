'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';
import { useState, useEffect } from 'react';

const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_RPC!);
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const jupiterApi = createJupiterApiClient();

export default function SwapWidget({ tokenMint, tokenSymbol }: { tokenMint: string; tokenSymbol: string }) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  // Find the Privy embedded wallet (handles Solana embedded wallets)
  const wallet = wallets.find(w => w.walletClientType === 'privy');
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    (async () => {
      try {
        const pubkey = new PublicKey(wallet.address);
        const sol = await connection.getBalance(pubkey);
        setSolBalance(sol / 1e9);
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, { mint: new PublicKey(tokenMint) });
          const bal = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
          setTokenBalance(bal);
        } catch {
          setTokenBalance(0);
        }
      } catch (err) {
        console.error('Balance fetch error:', err);
      }
    })();
  }, [wallet, tokenMint]);

  const fetchQuote = async () => {
    if (!amount) return;
    setLoading(true);
    const inputMint = mode === 'buy' ? SOL_MINT : tokenMint;
    const outputMint = mode === 'buy' ? tokenMint : SOL_MINT;
    const amountLamports = Math.floor(parseFloat(amount) * 10 ** (mode === 'buy' ? 9 : 6));
    try {
      const quoteRes = await jupiterApi.quoteGet({
        inputMint,
        outputMint,
        amount: amountLamports,
        slippageBps: 100,
      });
      setQuote(quoteRes);
    } catch (err) {
      console.error('Quote error:', err);
    } finally {
      setLoading(false);
    }
  };

  const swap = async () => {
    if (!wallet || !quote) return;
    setLoading(true);
    try {
      // Get serialized swap transaction from Jupiter
      const swapResult = await jupiterApi.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: wallet.address,
        },
      });

      // Deserialize the transaction
      const swapTxBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(swapTxBuf);

      // Get the Solana provider from the wallet and sign + send
      const solanaProvider = await (wallet as any).getProvider?.();
      if (solanaProvider?.signAndSendTransaction) {
        const result = await solanaProvider.signAndSendTransaction(tx);
        console.log('Swap tx:', result.signature ?? result);
      } else if (solanaProvider?.signTransaction) {
        const signed = await solanaProvider.signTransaction(tx);
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log('Swap tx:', signature);
      } else {
        // Fallback: use connection to send raw (won't work without signing)
        console.error('No signing method available on wallet provider');
      }
    } catch (err) {
      console.error('Swap error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-gray-400">Connect wallet to trade</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span>SOL: {solBalance.toFixed(4)}</span>
        <span>{tokenSymbol}: {tokenBalance.toFixed(4)}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setMode('buy')} className={`flex-1 px-3 py-1 rounded ${mode === 'buy' ? 'bg-green-500' : 'bg-gray-700'}`}>Buy</button>
        <button onClick={() => setMode('sell')} className={`flex-1 px-3 py-1 rounded ${mode === 'sell' ? 'bg-red-500' : 'bg-gray-700'}`}>Sell</button>
      </div>
      <input
        type="number"
        placeholder={`Amount in ${mode === 'buy' ? 'SOL' : tokenSymbol}`}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="bg-gray-800 p-2 rounded"
      />
      <button
        onClick={fetchQuote}
        disabled={loading || !amount}
        className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Get Quote'}
      </button>
      {quote && (
        <div className="text-sm">
          <p>You receive: {(quote.outAmount / 10 ** (mode === 'buy' ? 6 : 9)).toFixed(6)}</p>
          <p>Price impact: {quote.priceImpactPct}%</p>
          <button
            onClick={swap}
            disabled={loading}
            className="bg-green-500 hover:bg-green-400 p-2 rounded mt-2 w-full font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'Swapping...' : 'Swap'}
          </button>
        </div>
      )}
    </div>
  );
}