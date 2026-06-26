// ChadWallet brand configuration — single source of truth for URLs and assets.
// Edit this file to update links across the entire app.

export const brand = {
  name: 'ChadWallet',
  tagline: 'Solana, all in one app',

  // ── App stores ──────────────────────────────────────────────────────
  appStore: {
    ios: 'https://apps.apple.com/us/app/chadwallet/id6757367474',
    android: 'https://play.google.com/store/apps/details?id=xyz.chadwallet.www',
  },

  // ── Social links ────────────────────────────────────────────────────
  // TODO: replace with real ChadWallet URLs when available
  social: {
    twitter: 'https://x.com/getchadwallet',
    discord: 'https://discord.gg/chadwallet', // TODO: real URL
    instagram: 'https://www.instagram.com/chadwallet', // TODO: real URL
    youtube: 'https://www.youtube.com/@chadwallet', // TODO: real URL
    linkedin: 'https://www.linkedin.com/company/chadwallet/',
  },

  // ── Legal pages ─────────────────────────────────────────────────────
  legal: {
    privacyPolicy: '/privacy-policy',
    termsOfService: '/terms',
  },

  // ── Internal pages ─────────────────────────────────────────────────
  pages: {
    blog: '/blog',
    faq: '/faq',
    affiliates: '/affiliates',
  },

  // ── Brand assets ────────────────────────────────────────────────────
  assets: {
    logoDark: '/logo/dark.png',
    logoLight: '/logo/light.png',
  },
} as const;

/** Convenience: pick the most appropriate app store link for the platform. */
export function getAppStoreLink(platform?: 'ios' | 'android'): string {
  if (platform) return brand.appStore[platform];
  // Generic link — use iOS as default (more common on landing pages)
  return brand.appStore.ios;
}
