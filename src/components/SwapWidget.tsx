'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTokenOverview } from '@/lib/birdeye';

const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_RPC!);
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const jupiterApi = createJupiterApiClient();

type Slippage = 0.5 | 1 | 3;

const SLIPPAGE_OPTIONS: Slippage[] = [0.5, 1, 3];

export default function SwapWidget({ tokenMint, tokenSymbol, tokenPrice }: { tokenMint: string; tokenSymbol: string; tokenPrice?: number }) {
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets.find(w => w.walletClientType === 'privy');

  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState<Slippage>(1);
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
        console.error('Balance fetch error:', err);
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
      console.error('Quote error:', err);
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
        console.error('No signing method available on wallet provider');
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
            console.error('Balance refresh error:', e);
          }
        }, 3000);
      }
    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err?.response?.data?.message || err?.message || 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  // Price impact level
  const priceImpact = quote?.priceImpactPct ? parseFloat(quote.priceImpactPct) : 0;
  const impactLevel = priceImpact > 5 ? 'high' : priceImpact > 1 ? 'medium' : 'low';
  const impactColor = impactLevel === 'high' ? '#FF1744' : impactLevel === 'medium' ? '#FFA726' : '#00C853';

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Swap</h3>
        <div className="flex rounded-xl overflow-hidden">
          <button
            onClick={() => { setMode('buy'); setQuote(null); setTxSignature(null); setError(null); }}
            className={`px-5 py-1.5 text-xs font-mono font-bold transition-all duration-200 ${
              mode === 'buy'
                ? 'bg-[#00df89] text-[#09090F]'
                : 'bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151]'
            }`}
          >
            BUY
          </button>
          <button
            onClick={() => { setMode('sell'); setQuote(null); setTxSignature(null); setError(null); }}
            className={`px-5 py-1.5 text-xs font-mono font-bold transition-all duration-200 ${
              mode === 'sell'
                ? 'bg-[#FF1744] text-white'
                : 'bg-[#1F2937] text-[#9CA3AF] hover:bg-[#374151]'
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Balances */}
      <div className="flex justify-between text-[11px] font-mono text-[#A0A0A0]">
        <span>SOL: <span className="text-white tabular-nums">{solBalance.toFixed(4)}</span></span>
        <span>{tokenSymbol}: <span className="text-white tabular-nums">{tokenBalance.toFixed(4)}</span></span>
      </div>

      {/* Input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[#09090F] rounded-lg border border-[rgba(255,255,255,.05)] focus-within:border-[#39FF14]/40 transition-colors">
          <input
            type="number"
            placeholder={`Amount in $`}
            value={amount}
            onChange={e => { setAmount(e.target.value); setQuote(null); setTxSignature(null); setError(null); }}
            className="flex-1 bg-transparent px-4 py-3 text-white font-mono tabular-nums text-sm outline-none placeholder:text-[#555]"
          />
          {amount && (
            <button
              onClick={() => { setAmount(''); setQuote(null); setError(null); }}
              className="px-2 text-[#A0A0A0] hover:text-white transition-colors text-xs"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>
        {/* Quick-fill buttons — USD amounts */}
        <div className="flex gap-1.5 mt-2">
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
              className="flex-1 py-1 text-[10px] font-mono text-[#A0A0A0] bg-[#09090F] rounded border border-[rgba(255,255,255,.05)] hover:text-white hover:border-[#39FF14]/30 transition-all"
            >
              ${usd}
            </button>
          ))}
        </div>
      </div>

      {/* Slippage selector */}
      <div>
        <label className="text-[10px] text-[#A0A0A0] font-mono uppercase tracking-wider mb-1.5 block">
          Max Slippage
        </label>
        <div className="flex gap-2">
          {SLIPPAGE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => { setSlippage(opt); setQuote(null); }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all duration-200 ${
                slippage === opt
                  ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                  : 'text-[#A0A0A0] border-[rgba(255,255,255,.05)] hover:text-white hover:border-[#39FF14]/20'
              }`}
            >
              {opt}%
            </button>
          ))}
        </div>
      </div>

      {/* Unverified token badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#09090F] rounded-lg border border-[rgba(255,255,255,.05)]">
        <svg className="w-3.5 h-3.5 shrink-0 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
        </svg>
        <span className="text-[10px] font-mono text-[#6B7280]">Unverified token — trade at your own risk</span>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#FF1744]/10 border border-[#FF1744]/20 rounded-lg">
          <span className="text-[#FF1744] text-xs font-mono">{error}</span>
        </div>
      )}

      {/* Quote section */}
      {quote && (
        <div className="flex flex-col gap-2 bg-[#09090F] rounded-lg border border-[rgba(255,255,255,.05)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A0A0A0] font-mono uppercase tracking-wider">You receive</span>
            <span className="text-sm font-mono font-bold text-white tabular-nums">
              {(quote.outAmount / 10 ** (mode === 'buy' ? 6 : 9)).toFixed(6)} {mode === 'buy' ? tokenSymbol : 'SOL'}
            </span>
          </div>

          {/* Price impact */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A0A0A0] font-mono uppercase tracking-wider">Price Impact</span>
            <span className="text-xs font-mono font-bold tabular-nums" style={{ color: impactColor }}>
              {priceImpact.toFixed(2)}%
              {impactLevel === 'high' && (
                <span className="ml-1.5 text-[10px]">⚠️</span>
              )}
            </span>
          </div>

          {/* Price impact warning */}
          {impactLevel === 'high' && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#FF1744]/10 rounded text-[10px] font-mono text-[#FF1744]">
              <span>⚠️</span>
              <span>High price impact — you may lose significant value</span>
            </div>
          )}

          {/* Quote age + refresh */}
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-[rgba(255,255,255,.05)]">
            <span className="text-[10px] text-[#A0A0A0] font-mono tabular-nums">
              Quote age: {quoteAge}s
            </span>
            <button
              onClick={fetchQuote}
              disabled={loading}
              className="flex items-center gap-1 text-[10px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors disabled:opacity-50"
            >
              <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Execute swap button */}
          <button
            onClick={swap}
            disabled={swapping || impactLevel === 'high'}
            className={`w-full py-3 rounded-lg font-mono font-bold text-sm transition-all duration-300 mt-1 ${
              mode === 'buy'
                ? swapping
                  ? 'bg-[#00C853]/30 text-[#00C853]/50 cursor-not-allowed'
                  : 'bg-[#00df89] text-[#09090F] hover:bg-[#00E05A] hover:scale-[1.01] active:scale-[0.99]'
                : swapping
                  ? 'bg-[#FF1744]/30 text-[#FF1744]/50 cursor-not-allowed'
                  : 'bg-[#FF1744] text-white hover:bg-[#FF3D5C] animate-glow-pulse hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {swapping ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Swapping...
              </span>
            ) : (
              `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
            )}
          </button>
        </div>
      )}

      {/* Get Quote / Connect button (when no quote) */}
      {!quote && (
        <button
          onClick={() => { if (!user) { login(); } else { fetchQuote(); } }}
          disabled={loading || (!user ? false : !amount || parseFloat(amount) <= 0)}
          className={`w-full py-3 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${
            !user
              ? 'bg-[#00df89] text-[#09090F] hover:bg-[#00E05A] hover:scale-[1.01] active:scale-[0.99]'
              : loading || !amount || parseFloat(amount) <= 0
                ? 'bg-[#1F1F1F] text-[#555] cursor-not-allowed'
                : mode === 'buy'
                  ? 'bg-[#00df89] text-[#09090F] hover:bg-[#00E05A] hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-[#FF1744] text-white hover:bg-[#FF3D5C] hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {!user ? 'Connect wallet to trade' : loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching Quote...
            </span>
          ) : (
            'Get Quote'
          )}
        </button>
      )}

      {/* Transaction success */}
      {txSignature && (
        <div className="flex flex-col gap-2 p-3 bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-[#00C853] text-sm">✓</span>
            <span className="text-xs font-mono text-[#00C853]">Swap successful!</span>
          </div>
          <a
            href={`https://solscan.io/tx/${txSignature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-[#39FF14]/70 hover:text-[#39FF14] transition-colors truncate"
          >
            View on Solscan →
          </a>
        </div>
      )}
    </div>
  );
}
