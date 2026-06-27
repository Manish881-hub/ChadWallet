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
  // HSTS — enforce HTTPS for 1 year, include subdomains, allow preload list
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // Restrict browser features the app doesn't need
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.privy.io https://js.stripe.com https://s3.tradingview.com https://s.tradingview.com https://tv-static-images.tradingview.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://s3.tradingview.com https://s.tradingview.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://s3.tradingview.com https://s.tradingview.com",
      "connect-src 'self' https://*.birdeye.so https://*.alchemy.com https://*.jup.ag https://*.privy.io https://api.privy.io wss://*.privy.io https://solana-mainnet.g.alchemy.com https://explorer-api.walletconnect.com https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://api.coingecko.com https://*.tradingview.com wss://*.tradingview.com https://scanner.tradingview.com",
      "frame-src 'self' https://*.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://s.tradingview.com https://*.tradingview.com",
      "child-src 'self' blob: https://s.tradingview.com https://*.tradingview.com",
      "frame-ancestors 'self'",
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  turbopack: {},
  webpack: (config) => {
    // Redirect the broken react-aria/* subpath imports to their real .js files.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...reactAriaAliases,
      // @floating-ui/dom@1.7.6 ESM entry re-exports getOverflowAncestors from
      // @floating-ui/utils/dom, but webpack can't trace the indirect re-export.
      // The browser-bundled entry has the function inlined and exports it directly.
      '@floating-ui/dom': path.join(
        process.cwd(), 'node_modules', '@floating-ui', 'dom', 'dist',
        'floating-ui.dom.browser.mjs',
      ),
      // @reown/appkit-controllers imports W3mFrameRpcConstants from
      // @reown/appkit-wallet/utils, but it was removed in a breaking update.
      // These are internal WalletConnect components never used by our app.
      '@reown/appkit-wallet/utils': path.join(process.cwd(), 'empty-module.js'),
    };

    // Stub out broken @solana-program/* transitive imports that reference
    // @solana/kit subpaths not present in v5.
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      '@solana-program/system': false,
      '@solana-program/token': false,
      '@solana-program/token-2022': false,
      '@solana-program/memo': false,
    };

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webpack = require('webpack');
    config.plugins = config.plugins || [];

    // @privy-io/react-auth does optional dynamic imports for packages we don't use.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@farcaster\/mini-app-solana$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@stripe\/crypto$/,
      }),
    );

    // Suppress warnings from @solana-program/* and @reown/* broken imports.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { message: /SOLANA_ERROR__PROGRAM_CLIENTS/ },
      { message: /program-client-core/ },
      { message: /Can't resolve '@solana-program/ },
      { message: /W3mFrameRpcConstants/ },
      { message: /@reown\/appkit/ },
    ];

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
