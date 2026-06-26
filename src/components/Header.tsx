import Link from "next/link";
import SignInButton from "./SignInButton";
import { brand } from "@/lib/brand";

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const PlayStoreIcon = () => (
  <svg viewBox="0 0 512 512" width="20" height="20">
    <path fill="#34A853" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
    <path fill="#4285F4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
    <path fill="#FBBC04" d="M425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
    <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 flex items-center h-16 pt-3 px-4 sm:px-5 justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">

        <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white">
          ChadWallet
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Apple App Store — icon only on mobile, full label on md+ */}
        <a
          href={brand.appStore.ios}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download on the App Store"
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-md hover:ring-1 hover:ring-white/40 transition-all"
        >
          <AppleIcon />
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-[10px] text-gray-300">Download on the</span>
            <span className="text-sm font-semibold text-white">App Store</span>
          </div>
        </a>

        {/* Google Play Store — icon only on mobile, full label on md+ */}
        <a
          href={brand.appStore.android}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get it on Google Play"
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-md hover:ring-1 hover:ring-white/40 transition-all"
        >
          <PlayStoreIcon />
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-[10px] text-gray-300">GET IT ON</span>
            <span className="text-sm font-semibold text-white">Google Play</span>
          </div>
        </a>

        {/* Login Button */}
        <div className="ml-1 md:ml-2">
          <SignInButton />
        </div>
      </div>
    </header>
  );
}
