import Link from 'next/link';
import { brand } from '@/lib/brand';

/* ─── Inline SVG social icons (no external deps) ───────────────────────── */

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ─── App Store Badge SVGs ─────────────────────────────────────────────── */

function AppleIcon() {
  return (
    <svg width="20" height="24" viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.52 3.24-12.68 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.05-7.41-11.76-14.04-5.05-7.08-9.2-15.29-12.47-24.65-3.51-10.11-5.27-19.9-5.27-29.38 0-10.87 2.35-20.24 7.05-28.09 3.69-6.31 8.6-11.3 14.75-14.95 6.15-3.66 12.79-5.53 19.95-5.63 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.26 3.6 1.35 0 5.92-1.41 13.66-4.24 7.31-2.62 13.48-3.71 18.53-3.29 13.69 1.1 23.98 6.52 30.82 16.28-12.25 7.43-18.31 17.83-18.2 31.18.1 10.41 3.89 19.07 11.35 25.95 3.38 3.21 7.15 5.69 11.35 7.46-.91 2.64-1.87 5.16-2.88 7.57zM119.04 7.93c0 8.16-2.98 15.78-8.93 22.83-7.18 8.4-15.86 13.25-25.27 12.48a25.42 25.42 0 0 1-.19-3.09c0-7.83 3.41-16.21 9.47-23.06 3.03-3.47 6.88-6.35 11.56-8.64 4.66-2.26 9.08-3.51 13.27-3.75.12 1.08.09 2.16.09 3.23z" />
    </svg>
  );
}

function PlayStoreIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 512 512" fill="currentColor">
      <path d="M48 59.49v393a28.12 28.12 0 0 0 44.67 22.67L288.89 256 92.67 36.65A28.14 28.14 0 0 0 48 59.49z" />
      <path d="M294.07 256 108.27 446.33l190.1-109.8c9.42-5.44 9.42-18.62 0-24.06L108.27 65.67z" opacity=".6" />
      <path d="m460.33 244.34-65.13-37.57-58.93 49.23 58.93 49.23 65.13-37.57a13.44 13.44 0 0 0 0-23.32z" />
      <path d="M108.27 65.67 395.2 231.46 336.27 256l58.93 24.54L108.27 446.33V65.67z" opacity=".3" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* ── Aurora gradient band at top ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, #5c67d6 20%, #7c3aed 50%, #5c67d6 80%, transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(92, 103, 214, 0.08), transparent)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-8">
        {/* ── Top section: brand + download ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 pb-12 border-b border-white/[0.06]">
          {/* Brand column */}
          <div className="flex flex-col gap-6 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src={brand.assets.logoDark}
                alt={brand.name}
                className="w-10 h-10 rounded-xl"
              />
              <span className="text-white font-bold text-xl tracking-tight">
                {brand.name}
              </span>
            </div>
            <p className="text-[#A4A9C6] text-[15px] leading-relaxed max-w-xs">
              The fastest way to trade any token on Solana. From memecoins to viral launches — all in one app.
            </p>

            {/* App store badges */}
            <div className="flex flex-wrap gap-3 mt-1">
              <a
                href={brand.appStore.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2.5 transition-all duration-300"
              >
                <span className="text-white/70 group-hover:text-white transition-colors">
                  <AppleIcon />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A4A9C6] leading-none tracking-wide">Download on the</span>
                  <span className="text-white text-[13px] font-semibold leading-tight">App Store</span>
                </div>
              </a>
              <a
                href={brand.appStore.android}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2.5 transition-all duration-300"
              >
                <span className="text-white/70 group-hover:text-white transition-colors">
                  <PlayStoreIcon />
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#A4A9C6] leading-none tracking-wide">Get it on</span>
                  <span className="text-white text-[13px] font-semibold leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 lg:justify-items-end">
            {/* Product */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-mono font-bold text-[#5c67d6] tracking-[0.16em] uppercase">
                Product
              </span>
              <div className="flex flex-col gap-2">
                <Link
                  href="/trade/So11111111111111111111111111111111111111112"
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Trade
                </Link>
                <a
                  href={brand.pages.blog}
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Blog
                </a>
                <a
                  href={brand.pages.faq}
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  FAQ
                </a>
                <a
                  href={brand.pages.affiliates}
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Affiliates
                </a>
              </div>
            </div>

            {/* Community */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-mono font-bold text-[#5c67d6] tracking-[0.16em] uppercase">
                Community
              </span>
              <div className="flex flex-col gap-2">
                <a
                  href={brand.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Discord
                </a>
                <a
                  href={brand.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  X / Twitter
                </a>
                <a
                  href={brand.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Instagram
                </a>
                <a
                  href={brand.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Youtube
                </a>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-mono font-bold text-[#5c67d6] tracking-[0.16em] uppercase">
                Legal
              </span>
              <div className="flex flex-col gap-2">
                <a
                  href={brand.legal.privacyPolicy}
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href={brand.legal.termsOfService}
                  className="text-sm text-[#A4A9C6] hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar: copyright + social icons ─────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-8">
          <p className="text-[13px] text-[#6B7280]">
            &copy; {new Date().getFullYear()} {brand.name} Inc. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-1">
            {[
              { href: brand.social.twitter, icon: <XIcon />, label: 'X / Twitter' },
              { href: brand.social.discord, icon: <DiscordIcon />, label: 'Discord' },
              { href: brand.social.instagram, icon: <InstagramIcon />, label: 'Instagram' },
              { href: brand.social.youtube, icon: <YoutubeIcon />, label: 'Youtube' },
              { href: brand.social.linkedin, icon: <LinkedInIcon />, label: 'LinkedIn' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
