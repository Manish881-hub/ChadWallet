import type { NextConfig } from "next";
import path from "path";
import { readdirSync, statSync } from "fs";

// react-aria@3.50.0 ships a broken package: its `exports` map's `import`
// condition points to `dist/exports/*.mjs`, but only `*.js` / `*.cjs` /
// `*.mjs.map` are actually in the tarball — the `.mjs` files are missing.
// @headlessui/react (a dep of @privy-io/react-auth) deep-imports these
// subpaths (react-aria/FocusRing, react-aria/private/focus/virtualFocus, etc.)
// via @react-aria/focus and @react-aria/interactions, so the build fails.
// Build a webpack alias for EVERY react-aria/* subpath → its real .js file.

function collectJsFiles(dir: string, relativePrefix: string, aliases: Record<string, string>) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (entry.endsWith(".js") && !entry.endsWith(".mjs.map")) {
      const name = entry.slice(0, -3); // strip .js
      aliases[`react-aria/${relativePrefix}${name}`] = fullPath;
    } else if (statSync(fullPath).isDirectory()) {
      collectJsFiles(fullPath, `${relativePrefix}${entry}/`, aliases);
    }
  }
}

const reactAriaAliases: Record<string, string> = {};
try {
  const distDir = path.join(process.cwd(), "node_modules", "react-aria", "dist");
  // Top-level exports: react-aria/FocusRing, react-aria/useFocusRing, etc.
  collectJsFiles(path.join(distDir, "exports"), "", reactAriaAliases);
  // Private subpaths: react-aria/private/focus/virtualFocus, etc.
  collectJsFiles(path.join(distDir, "private"), "private/", reactAriaAliases);
} catch {
  // node_modules not present yet; aliases simply won't apply
}


const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.privy.io https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.birdeye.so https://*.alchemy.com https://*.jup.ag https://*.privy.io https://api.privy.io wss://*.privy.io https://solana-mainnet.g.alchemy.com",
      "frame-src 'self' https://*.privy.io https://verify.walletconnect.com https://verify.walletconnect.org",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  webpack: (config) => {
    // Redirect the broken react-aria/* subpath imports to their real .js files.
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), ...reactAriaAliases };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.birdeye.so' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'assets.coingecko.com' },
    ],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
    ];
  },
};

export default nextConfig;