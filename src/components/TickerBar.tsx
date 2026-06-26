"use client";

import React, { useEffect, useState } from "react";

// ─── Coins to track ───────────────────────────────────────────────────────────
const COINS = [
  { id: "solana",           symbol: "SOL",   color: "#9945FF" },
  { id: "bitcoin",          symbol: "BTC",   color: "#F7931A" },
  { id: "ethereum",         symbol: "ETH",   color: "#627EEA" },
  { id: "bonk",             symbol: "BONK",  color: "#F7A33C" },
  { id: "dogwifcoin",       symbol: "WIF",   color: "#C084FC" },
  { id: "pepe",             symbol: "PEPE",  color: "#3EE65C" },
  { id: "jupiter-exchange-solana", symbol: "JUP", color: "#38BDF8" },
  { id: "raydium",          symbol: "RAY",   color: "#5EEAD4" },
  { id: "dogecoin",         symbol: "DOGE",  color: "#C2A633" },
  { id: "shiba-inu",        symbol: "SHIB",  color: "#FF6B2B" },
];

interface CoinData {
  symbol: string;
  color: string;
  price: number | null;
  change24h: number | null;
  loading: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1)    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(7)}`;
}

// ─── Single pill ─────────────────────────────────────────────────────────────
function TickerPill({ coin }: { coin: CoinData }) {
  const isUp   = (coin.change24h ?? 0) >= 0;
  const accent = coin.color;
  const changeColor = isUp ? "#22c55e" : "#f43f5e";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 999,
        background: `${accent}12`,
        border: `1px solid ${accent}28`,
        whiteSpace: "nowrap",
        flexShrink: 0,
        backdropFilter: "blur(8px)",
        transition: "border-color 0.3s",
      }}
    >
      {/* Accent dot */}
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 6px 2px ${accent}55`,
          flexShrink: 0,
        }}
      />

      {/* Symbol */}
      <span
        style={{
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.04em",
          fontFamily: "monospace",
        }}
      >
        {coin.symbol}
      </span>

      {/* Price */}
      {coin.loading ? (
        <span
          style={{
            width: 60,
            height: 12,
            borderRadius: 4,
            background: "rgba(255,255,255,0.07)",
            display: "inline-block",
          }}
        />
      ) : coin.price !== null ? (
        <span
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 13,
            fontVariantNumeric: "tabular-nums",
            fontFamily: "monospace",
          }}
        >
          {formatPrice(coin.price)}
        </span>
      ) : (
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>—</span>
      )}

      {/* Change */}
      {!coin.loading && coin.change24h !== null && (
        <span
          style={{
            color: changeColor,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "monospace",
            background: `${changeColor}18`,
            padding: "2px 7px",
            borderRadius: 999,
          }}
        >
          {isUp ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────
function Sep() {
  return (
    <span
      style={{
        color: "rgba(255,255,255,0.1)",
        fontSize: 18,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      /
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function TickerBar() {
  const [coins, setCoins] = useState<CoinData[]>(
    COINS.map((c) => ({ ...c, price: null, change24h: null, loading: true }))
  );
  const [paused, setPaused] = useState(false);

  // Fetch all prices via our server-side proxy (avoids CORS + rate-limit)
  useEffect(() => {
    let ignore = false;

    async function fetchPrices() {
      try {
        const res  = await fetch("/api/ticker");
        if (!res.ok) return;
        const data = await res.json();
        if (ignore) return;

        setCoins(
          COINS.map((c) => ({
            ...c,
            price:     data[c.id]?.usd             ?? null,
            change24h: data[c.id]?.usd_24h_change  ?? null,
            loading:   false,
          }))
        );
      } catch {
        if (!ignore) {
          setCoins((prev) => prev.map((c) => ({ ...c, loading: false })));
        }
      }
    }

    fetchPrices();
    const iv = setInterval(fetchPrices, 60_000); // refresh every 60 s
    return () => { ignore = true; clearInterval(iv); };
  }, []);

  // Build the row (duplicated for seamless loop)
  const row = (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        paddingRight: 12,
      }}
    >
      {coins.map((coin, i) => (
        <React.Fragment key={coin.symbol}>
          <TickerPill coin={coin} />
          {i < coins.length - 1 && <Sep />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        padding: "14px 0",
        background: "rgba(5,8,22,0.7)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left fade */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to right, #050816, transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
      {/* Right fade */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to left, #050816, transparent)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Scrolling track */}
      <div
        className="animate-marquee"
        style={{
          display: "inline-flex",
          animationPlayState: paused ? "paused" : "running",
          // override the CSS speed for a tighter feel
          animationDuration: "50s",
        }}
      >
        {/* Duplicate for seamless loop */}
        {row}
        {row}
      </div>
    </div>
  );
}
