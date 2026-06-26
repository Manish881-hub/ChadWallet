import Image from 'next/image';
import Link from 'next/link';
import { brand } from '@/lib/brand';

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center w-full pt-10 md:pt-20">
      <img
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute top-0 left-0 w-full h-[200vh] -z-10 pointer-events-none select-none object-cover"
        style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
        src="/landingpage/space-desktop.webp"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-5 md:gap-8">
        <div className="flex flex-col gap-2 items-center text-center w-full max-w-4xl animate-fade-up">
          {/* Giant Logo */}
          <div className="text-[90px] sm:text-[140px] lg:text-[180px] xl:text-[220px] font-bold leading-none tracking-tighter text-[#EAEBFF]/20 mb-2 select-none pointer-events-none font-display">
            ChadWallet
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.05] tracking-tight text-white font-display">
            {brand.tagline}
          </h1>
          <p className="mt-4 text-base sm:text-lg lg:text-xl text-secondary-text max-w-xl mx-auto leading-relaxed">
            Trade SOL, BTC, ETH, and 10,000+ tokens in seconds.
          </p>
        </div>

        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center animate-fade-up z-10">
          <Link
            href="/trade/So11111111111111111111111111111111111111112"
            className="inline-flex items-center justify-center bg-[#5c67d6] hover:bg-[#4a55a2] text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all text-sm sm:text-base"
          >
            Start trading
          </Link>
          <a
            href={brand.appStore.ios}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl border border-white/10 transition-all text-sm sm:text-base"
          >
            Download app
          </a>
        </div>
      </div>

      {/* Astronaut - Now in document flow with negative top margin */}
      <img
        src="/landingpage/astronaut-mobile.webp"
        alt="Astronaut"
        className="w-[240px] sm:w-[300px] lg:w-[380px] xl:w-[450px] max-w-[85vw] object-contain animate-[float_6s_ease-in-out_infinite] -mt-10 md:-mt-20 z-0 relative pointer-events-none"
      />

      {/* Decorative SVGs */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-none">
        <svg className="w-8 h-auto opacity-50" viewBox="0 0 40 24" fill="none">
          <rect x="0.5" y="0.5" width="39" height="23" rx="3.5" stroke="#9CA3AF" />
          <circle cx="20" cy="13" r="5" fill="#9CA3AF" opacity="0.3" />
        </svg>
        <svg className="w-10 h-auto opacity-50" viewBox="0 0 56 24" fill="none">
          <rect x="0.5" y="0.5" width="55" height="23" rx="3.5" stroke="#9CA3AF" />
          <circle cx="20" cy="12" r="7" fill="#9CA3AF" opacity="0.3" />
        </svg>
      </div>
    </section>
  );
}
