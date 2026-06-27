'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTokenOverview } from '@/lib/birdeye';
import { connection } from '@/lib/solana';
import { logger } from '@/lib/logger';
import LoginModal from './LoginModal';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const jupiterApi = createJupiterApiClient();

type Slippage = 0.5 | 1 | 3;

function formatUSD(value: number): string {
  if (!value || value <= 0) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export default function SwapWidget({
  tokenMint,
  tokenSymbol,
  tokenPrice,
  marketCap,
}: {
  tokenMint: string;
  tokenSymbol: string;
  tokenPrice?: number;
  marketCap?: number;
}) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets.find(w => w.walletClientType === 'privy');
  const [loginOpen, setLoginOpen] = useState(false);

  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [usdAmount, setUsdAmount] = useState('');
  const [slippage, setSlippage] = useState<Slippage>(1);
  const [showSlippage, setShowSlippage] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [quoteAge, setQuoteAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState(170);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [showUnverifiedInfo, setShowUnverifiedInfo] = useState(false);
  const slippageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const balanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse USD amount to number
  const usdValue = parseFloat(usdAmount) || 0;

  // Calculate SOL equivalent
  const solEquivalent = solPrice > 0 ? usdValue / solPrice : 0;

  // Available balance in USD
  const availableUsd = mode === 'buy' ? solBalance * solPrice : tokenBalance * (tokenPrice ?? 0);

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

  // Close slippage popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (slippageRef.current && !slippageRef.current.contains(e.target as Node)) {
        setShowSlippage(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuote = useCallback(async () => {
    if (usdValue <= 0) return;
    setLoading(true);
    setError(null);
    setQuote(null);
    setTxSignature(null);
    setQuoteAge(0);

    const inputMint = mode === 'buy' ? SOL_MINT : tokenMint;
    const outputMint = mode === 'buy' ? tokenMint : SOL_MINT;

    // Convert USD to lamports/token units
    let amountLamports: number;
    if (mode === 'buy') {
      amountLamports = Math.floor(solEquivalent * 1e9);
    } else {
      const tokenAmount = (tokenPrice ?? 0) > 0 ? usdValue / (tokenPrice ?? 1) : 0;
      amountLamports = Math.floor(tokenAmount * 1e6);
    }

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
  }, [usdValue, mode, tokenMint, slippage, solEquivalent, tokenPrice]);

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
        setUsdAmount('');
        setQuote(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Refresh balances after swap
        if (balanceTimerRef.current) clearTimeout(balanceTimerRef.current);
        balanceTimerRef.current = setTimeout(async () => {
          try {
            const pubkey = new PublicKey(wallet.address);
            const sol = await connection.getBalance(pubkey);
            if (!balanceTimerRef.current) return;
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

  const handleQuickFill = (usd: number) => {
    setUsdAmount(String(usd));
    setActivePreset(usd);
    setQuote(null);
    setTxSignature(null);
    setError(null);
  };

  const handleMaxFill = () => {
    if (availableUsd > 0) {
      // Leave a tiny buffer for SOL gas if buying
      const max = mode === 'buy' ? Math.max(0, availableUsd - 0.5) : availableUsd;
      setUsdAmount(max.toFixed(2));
      setActivePreset(null);
      setQuote(null);
      setError(null);
    }
  };

  // Price impact level
  const priceImpact = quote?.priceImpactPct ? parseFloat(quote.priceImpactPct) : 0;
  const impactLevel = priceImpact > 5 ? 'high' : priceImpact > 1 ? 'medium' : 'low';

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto scrollbar-thin" id="swap-panel" role="tabpanel" aria-labelledby={`swap-tab-${mode}`}>
      {/* Market cap */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-wider">Market cap</span>
        <span className="text-lg font-mono font-bold text-white tabular-nums">
          {formatUSD(marketCap ?? 0)}
        </span>
      </div>

      {/* Buy / Sell tabs */}
      <div className="flex rounded-lg overflow-hidden border border-[#1F1F1F]" role="tablist" aria-label="Swap mode">
        <button
          role="tab"
          aria-selected={mode === 'buy'}
          aria-controls="swap-panel"
          id="swap-tab-buy"
          tabIndex={mode === 'buy' ? 0 : -1}
          onClick={() => { setMode('buy'); setQuote(null); setTxSignature(null); setError(null); setUsdAmount(''); setActivePreset(null); }}
          className={`flex-1 py-2.5 text-sm font-bold transition-all duration-200 press-scale ${
            mode === 'buy'
              ? 'bg-[#00C853] text-[#0A0A0A]'
              : 'bg-transparent text-[#A0A0A0] hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          role="tab"
          aria-selected={mode === 'sell'}
          aria-controls="swap-panel"
          id="swap-tab-sell"
          tabIndex={mode === 'sell' ? 0 : -1}
          onClick={() => { setMode('sell'); setQuote(null); setTxSignature(null); setError(null); setUsdAmount(''); setActivePreset(null); }}
          className={`flex-1 py-2.5 text-sm font-bold transition-all duration-200 press-scale ${
            mode === 'sell'
              ? 'bg-[#FF1744] text-white'
              : 'bg-transparent text-[#A0A0A0] hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* USD Input */}
      <div className="flex flex-col gap-2">
        <div
          className={`flex items-center bg-[#0A0A0A] rounded-lg border transition-colors px-3 py-3 cursor-text ${
            inputRef.current === document.activeElement
              ? 'border-[#39FF14]/40'
              : 'border-[#1F1F1F]'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <span className="text-xl font-mono font-bold text-white mr-0.5">$</span>
          <input
            ref={inputRef}
            type="number"
            placeholder="0"
            aria-label="USD amount"
            value={usdAmount}
            onChange={e => {
              setUsdAmount(e.target.value);
              setQuote(null);
              setTxSignature(null);
              setError(null);
              setActivePreset(null);
            }}
            className="flex-1 bg-transparent text-xl font-mono font-bold text-white tabular-nums outline-none placeholder:text-[#333] w-0 min-w-0"
          />
          <span className="text-xs font-mono text-[#888] ml-2 shrink-0">
            {usdAmount ? '' : 'Enter amount'}
          </span>
          {usdAmount && (
            <button
              onClick={(e) => { e.stopPropagation(); setUsdAmount(''); setQuote(null); setError(null); setActivePreset(null); }}
              className="ml-1 text-[#888] hover:text-white transition-colors text-xs press-scale"
              title="Clear"
            >
              ✕
            </button>
          )}
        </div>

        {/* SOL equivalent */}
        {usdValue > 0 && mode === 'buy' && (
          <span className="text-[10px] font-mono text-[#888] tabular-nums px-1">
            ≈ {solEquivalent.toFixed(6)} SOL
          </span>
        )}
      </div>

      {/* Quick-fill buttons + Settings gear */}
      <div className="flex items-center gap-1.5">
        {[10, 100, 500, 1000].map(usd => (
          <button
            key={usd}
            onClick={() => handleQuickFill(usd)}
            className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded-md border transition-all press-scale ${
              activePreset === usd
                ? mode === 'buy'
                  ? 'text-[#00C853] border-[#00C853]/30 bg-[#00C853]/10'
                  : 'text-[#FF1744] border-[#FF1744]/30 bg-[#FF1744]/10'
                : 'text-[#A0A0A0] bg-[#0A0A0A] border-[#1F1F1F] hover:text-white hover:border-[#333]'
            }`}
          >
            ${usd}
          </button>
        ))}

        {/* Settings gear */}
        <div className="relative" ref={slippageRef}>
          <button
            onClick={() => setShowSlippage(!showSlippage)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-[#1F1F1F] bg-[#0A0A0A] text-[#A0A0A0] hover:text-white hover:border-[#333] transition-colors press-scale"
            title="Slippage settings"
            aria-label="Slippage settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>

          {/* Slippage popover */}
          {showSlippage && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#111111] border border-[#1F1F1F] rounded-lg p-3 z-50 animate-slide-down shadow-xl">
              <span className="text-[10px] font-mono text-[#A0A0A0] uppercase tracking-wider mb-2 block">Slippage</span>
              <div className="flex gap-1">
                {([0.5, 1, 3] as Slippage[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSlippage(s); setShowSlippage(false); }}
                    className={`flex-1 py-1.5 text-[11px] font-mono font-bold rounded-md border transition-all press-scale ${
                      slippage === s
                        ? 'text-[#39FF14] border-[#39FF14]/30 bg-[#39FF14]/10'
                        : 'text-[#A0A0A0] border-[#1F1F1F] hover:text-white'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available balance */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#9CA3AF]">${availableUsd.toFixed(2)} available</span>
        <button
          onClick={handleMaxFill}
          className="text-[10px] font-mono font-bold text-[#39FF14]/70 hover:text-[#39FF14] transition-colors press-scale"
          aria-label="Use maximum amount"
        >
          Max
        </button>
      </div>

      {/* Quote summary */}
      {quote && (
        <div className="flex flex-col gap-1.5 bg-[#0A0A0A] rounded-lg border border-[#1F1F1F] px-3 py-2 animate-slide-in">
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
            <span className="text-[9px] text-[#888] font-mono tabular-nums">{quoteAge}s ago</span>
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

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FF1744]/10 border border-[#FF1744]/20 rounded-lg animate-slide-in" role="alert">
          <span className="text-[#FF1744] text-[10px] font-mono">{error}</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => {
          if (!user) { setLoginOpen(true); }
          else if (quote) { swap(); }
          else { fetchQuote(); }
        }}
        disabled={
          swapping ||
          (!user ? false : usdValue <= 0) ||
          (quote ? impactLevel === 'high' : false) ||
          loading
        }
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 press-scale ${
          showSuccess
            ? 'bg-[#00C853] text-[#0A0A0A] animate-success-pulse'
            : !user
              ? 'bg-[#00C853] text-[#0A0A0A] hover:bg-[#00E05A]'
              : swapping || (quote ? impactLevel === 'high' : usdValue <= 0)
                ? 'bg-[#1F1F1F] text-[#888] cursor-not-allowed'
                : mode === 'buy'
                  ? 'bg-[#00C853] text-[#0A0A0A] hover:bg-[#00E05A]'
                  : 'bg-[#FF1744] text-white hover:bg-[#FF3D5C]'
        }`}
      >
        {swapping ? (
          <span className="flex items-center justify-center gap-2" aria-live="polite">
            <svg className="w-4 h-4 animate-spin" aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Swapping…
          </span>
        ) : showSuccess ? (
          <span aria-live="polite">✓ Swap successful!</span>
        ) : !user ? (
          'Sign in to trade'
        ) : quote ? (
          `${mode === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
        ) : (
          `Buy ${tokenSymbol}`
        )}
      </button>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Unverified token warning */}
      <div className="flex items-center gap-2 px-2.5 py-2 bg-[#FFA726]/5 border border-[#FFA726]/15 rounded-lg relative" role="note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-[11px] font-mono text-[#FFA726]">Unverified token</span>
        <button
          onClick={() => setShowUnverifiedInfo(!showUnverifiedInfo)}
          className="ml-auto text-[#FFA726]/50 hover:text-[#FFA726] transition-colors"
          title="Unverified tokens may be risky. Always do your own research."
          aria-label="More info about unverified tokens"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
        {showUnverifiedInfo && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#1A1A1A] border border-[#FFA726]/20 rounded-lg text-[10px] font-mono text-[#FFA726] z-10 animate-slide-down">
            This token has not been verified. It may be a scam or rug pull.
            Always do your own research before trading.
          </div>
        )}
      </div>

      {/* Transaction success */}
      {txSignature && (
        <div className="flex flex-col gap-1 p-2.5 bg-[#00C853]/5 border border-[#00C853]/20 rounded-lg animate-slide-in">
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
