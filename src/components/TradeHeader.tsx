import Link from 'next/link';
import SignInButton from './SignInButton';

const AppleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const PlayStoreIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 20.5v-17l13.5 8.5L3 20.5zm15-6.5l4.5 2.8L18 20.5V14zm0-4l4.5-2.8L18 3.5v6.5z" />
  </svg>
);

export default function TradeHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#050816]">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <img src="/logo/dark.png" alt="" className="w-7 h-7 object-contain" />
        <span className="text-base font-semibold tracking-tight text-white">ChadWallet</span>
      </Link>

      <div className="flex items-center gap-2">
        <a
          href="https://apps.apple.com/us/app/chadwallet/id6757367474"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="App Store"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
        >
          <AppleIcon />
          <span className="text-[10px] leading-none text-white font-medium hidden sm:inline">App Store</span>
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Play"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-md hover:bg-white/20 transition-colors"
        >
          <PlayStoreIcon />
          <span className="text-[10px] leading-none text-white font-medium hidden sm:inline">Google Play</span>
        </a>
        <SignInButton />
      </div>
    </header>
  );
}
