'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

const DEFAULT_TRADE_ADDRESS = 'So11111111111111111111111111111111111111112';

/**
 * OAuthCallbackHandler — always mounted inside PrivyProvider.
 *
 * After an OAuth redirect, Privy lands the user back on the origin with
 * ?privy_oauth_state=...&privy_oauth_code=... query params.
 *
 * This component watches for the `authenticated` flag to become true
 * while those params are present, then navigates to the trade page.
 * It also handles the case where a user is already authenticated and
 * sitting on the landing page.
 */
export default function OAuthCallbackHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { ready, authenticated } = usePrivy();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only act when Privy has finished initializing
    if (!ready || hasRedirected.current) return;

    // Only redirect if the user is authenticated
    if (!authenticated) return;

    // Only redirect from the landing page (/) — don't hijack /trade/* navigation
    if (pathname !== '/') return;

    // Case 1: OAuth callback — URL has privy_oauth_state param
    // Case 2: User is already logged in but landed on "/"
    // In both cases, send them to the trade page
    hasRedirected.current = true;
    router.replace(`/trade/${DEFAULT_TRADE_ADDRESS}`);
  }, [ready, authenticated, pathname, searchParams, router]);

  return null;
}
