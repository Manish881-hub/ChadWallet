import { NextRequest } from "next/server";

const COINGECKO_IDS = [
  "solana",
  "bitcoin",
  "ethereum",
  "bonk",
  "dogwifcoin",
  "pepe",
  "jupiter-exchange-solana",
  "raydium",
  "dogecoin",
  "shiba-inu",
].join(",");

// Cache the last successful response for 60 s to avoid rate-limiting
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET(_req: NextRequest) {
  // Return cached data if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return Response.json(cache.data, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return Response.json(
        { error: `CoinGecko responded with ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    cache = { data, ts: Date.now() };

    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (err) {
    // If we have stale cache, return it rather than failing
    if (cache) {
      return Response.json(cache.data, {
        headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
      });
    }
    console.error("[ticker] fetch failed:", err);
    return Response.json({ error: "upstream fetch failed" }, { status: 502 });
  }
}
