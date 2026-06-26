'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';
import { useState, useEffect, useCallback } from 'react';
import { fetchTokenOverview } from '@/lib/birdeye';
import { logger } from '@/lib/logger';
import LoginModal from './LoginModal';

const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_RPC!);
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const jupiterApi = createJupiterApiClient();

type Slippage = 0.5 | 1 | 3;

export default function SwapWidget({ tokenMint, tokenSymbol, tokenPrice }: { tokenMint: string; tokenSymbol: string; tokenPrice?: number }) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets.find(w => w.walletClientType === 'privy');
  const [loginOpen, setLoginOpen] = useState(false);

  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage] = useState<Slippage>(1);
  const [quote, setQuote] = useState<any>(null);
  const [quoteAge, setQuoteAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState(170);

  // Fetch SOL price
  useEffect(() => {
    fetchTokenOverview(SOL_MINT).then((info) => {
      if (info?.price) setSolPrice(info.price);
    });
  }, []);

  // Fetch balances
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
        logger.error('Balance fetch error', { error: err });
      }
    })();
  }, [wallet, tokenMint]);

  // Quote age timer
  useEffect(() => {
    if (!quote) { setQuoteAge(0); return; }
    const interval = setInterval(() => {
      setQuoteAge(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quote]);

  const fetchQuote = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError(null);
    setQuote(null);
    setTxSignature(null);
    setQuoteAge(0);

    const inputMint = mode === 'buy' ? SOL_MINT : tokenMint;
    const outputMint = mode === 'buy' ? tokenMint : SOL_MINT;
    const amountLamports = Math.floor(parseFloat(amount) * 10 ** (mode === 'buy' ? 9 : 6));

    try {
      const quoteRes = await jupiterApi.quoteGet({
        inputMint,
        outputMint,
        amount: amountLamports,
        slippageBps: Math.floor(slippage * 100),
      });
      setQuote(quoteRes);
    } catch (err: any) {
      logger.error('Quote fetch error', { error: err });
      setError(err?.response?.data?.message || 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  }, [amount, mode, tokenMint, slippage]);

  const swap = async () => {
    if (!wallet || !quote) return;
    setSwapping(true);
    setError(null);

    try {
      const swapResult = await jupiterApi.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: wallet.address,
        },
      });

      const swapTxBuf = Buffer.from(swapResult.swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(swapTxBuf);

      const solanaProvider = await (wallet as any).getProvider?.();
      let signature: string | undefined;

      if (solanaProvider?.signAndSendTransaction) {
        const result = await solanaProvider.signAndSendTransaction(tx);
        signature = result.signature ?? result;
      } else if (solanaProvider?.signTransaction) {
        const signed = await solanaProvider.signTransaction(tx);
        signature = await connection.sendRawTransaction(signed.serialize());
      } else {
        logger.error('No signing method available on wallet provider');
        setError('Wallet does not support transaction signing');
        return;
      }

      if (signature) {
        setTxSignature(signature);
        setAmount('');
        setQuote(null);

        // Refresh balances after swap
        setTimeout(async () => {
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
          } catch (e) {
            logger.error('Balance refresh error', { error: e });
          }
        }, 3000);
      }
    } catch (err: any) {
      logger.error('Swap execution error', { error: err });
      setError(err?.response?.data?.message || err?.message || 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  // Price impact level
  const priceImpact = quote?.priceImpactPct ? parseFloat(quote.priceImpactPct) : 0;
  const impactLevel = priceImpact > 5 ? 'high' : priceImpact > 1 ? 'medium' : 'low';

  return (
    <div className="flex flex-col gap-2.5 p-3">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-mono font-bold text-[#A0A0A0] uppercase tracking-wider">Swap</h3>
        <div className="flex rounded-lg overflow-hidden border border-[#1F1F1F]">
          <button
            onClick={() => { setMode('buy'); setQuote(null); setTxSignature(null); setError(null); }}
            className={`px-4 py-1 text-[10px] font-mono font-bold transition-all duration-200 ${
              mode === 'buy'
                ? 'bg-[#00C853] text-[#0A0A0A]'
                : 'bg-transparent text-[#A0A0A0] hover:text-white'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => { setMode('sell'); setQuote(null); setTxSignature(null); setError(null); }}
            className={`px-4 py-1 text-[10px] font-mono font-bold transition-all duration-200 ${
              mode === 'sell'
                ? 'bg-[#FF1744] text-white'
                : 'bg-transparent text-[#A0A0A0] hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Balances */}
      <div className="flex justify-between text-[10px] font-mono text-[#A0A0A0]">
        <span>SOL: <span className="text-white tabular-nums">{solBalance.toFixed(4)}</span></span>
        <span>{tokenSymbol}: <span className="text-white tabular-nums">{tokenBalance.toFixed(2)}</span></span>
      </div>

      {/* Input */}
      <div className="relative">
        <div className="flex items-center bg-[#0A0A0A] rounded-lg border border-[#1F1F1F] focus-within:border-[#39FF14]/40 transition-colors">
          <span className="pl-3 text-sm font-mono text-[#A0A0A0]">$</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setQuote(null); setTxSignature(null); setError(null); }}
            className="flex-1 bg-transparent px-2 py-2.5 text-white font-mono tabular-nums text-sm outline-none placeholder:text-[#333]"
          />
          {amount && (
            <button
              onClick={() => { setAmount(''); setQuote(null); setError(null); }}
              className="px-2 text-[#555] hover:text-white transition-colors text-xs"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        {/* Quick-fill buttons — USD amounts */}
        <div className="flex gap-1.5 mt-1.5">
          {[10, 100, 500, 1000].map(usd => (
            <button
              key={usd}
              onClick={() => {
                const price = mode === 'buy' ? solPrice : (tokenPrice ?? 0);
                if (price <= 0) return;
                const val = (usd / price).toFixed(6);
                setAmount(val);
                setQuote(null);
              }}
              className="flex-1 py-1 text-[10px] font-mono font-bold text-[#A0A0A0] bg-[#0A0A0A] rounded border border-[#1F1F1F] hover:text-white hover:border-[#39FF14]/30 transition-all"
            >
              ${usd}
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FF1744]/10 border border-[#FF1744]/20 rounded-lg">
          <span className="text-[#FF1744] text-[10px] font-mono">{error}</span>
        </div>
      )}

      {/* Quote summary — shown inline, compact */}
      {quote && (
        <div className="flex flex-col gap-1.5 bg-[#0A0A0A] rounded-lg border border-[#1F1F1F] px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A0A0A0] font-mono">You receive</span>
            <span className="text-xs font-mono font-bold text-white tabular-nums">
              {(quote.outAmount / 10 ** (mode === 'buy' ? 6 : 9)).toFixed(6)} {mode === 'buy' ? tokenSymbol : 'SOL'}
            </span>
          </div>
          {priceImpact > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#A0A0A0] font-mono">Impact</span>
              <span className={`text-[10px] font-mono font-bold tabular-nums ${impactLevel === 'high' ? 'text-[#FF1744]' : impactLevel === 'medium' ? 'text-[#FFA726]' : 'text-[#00C853]'}`}>
                {priceImpact.toFixed(2)}%{impactLevel === 'high' && ' ⚠️'}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-[#1F1F1F]">
            <span className="text-[9px] text-[#555] font-mono tabular-nums">{quoteAge}s ago</span>
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="text-[9px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'refresh'}
            </button>
          </div>
        </div>
      )}

      {/* Main action button */}
      <button
        onClick={() => {
          if (!user) { setLoginOpen(true); }
          else if (quote) { swap(); }
          else { fetchQuote(); }
        }}
        disabled={
          swapping ||
          (!user ? false : !amount || parseFloat(amount) <= 0) ||
          (quote ? impactLevel === 'high' : false) ||
          loading
        }
        className={`w-full py-2.5 rounded-lg font-mono font-bold text-xs transition-all duration-300 ${
          !user
            ? 'bg-[#00C853] text-[#0A0A0A] hover:bg-[#00E05A]'
            : swapping || (quote ? impactLevel === 'high' : !amount || parseFloat(amount) <= 0)
              ? 'bg-[#1F1F1F] text-[#555] cursor-not-allowed'
              : mode === 'buy'
                ? 'bg-[#00C853] text-[#0A0A0A] hover:bg-[#00E05A] active:scale-[0.98]'
                : 'bg-[#FF1744] text-white hover:bg-[#FF3D5C] active:scale-[0.98]'
        }`}
      >
        {swapping ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Swapping...
          </span>
        ) : !user ? (
          'Sign in to trade'
        ) : quote ? (
          `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
        ) : (
          `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
        )}
      </button>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Transaction success */}
      {txSignature && (
        <div className="flex flex-col gap-1 p-2.5 bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00C853] text-xs">✓</span>
            <span className="text-[10px] font-mono text-[#00C853]">Swap successful!</span>
          </div>
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors truncate"
          >
            View on Solscan →
          </a>
        </div>
      )}
    </div>
  );
}
