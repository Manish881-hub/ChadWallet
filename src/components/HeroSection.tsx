import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen">
      <img
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute top-0 left-0 w-full -z-10 pointer-events-none select-none"
        src="/landingpage/space-bg.webp"
      />



      <div className="relative z-10 flex flex-col items-center pt-16 md:pt-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-up">
          {/* Giant Logo */}
          <div className="text-[140px] md:text-[220px] font-bold leading-none tracking-tighter text-[#EAEBFF]/20 mb-2 select-none pointer-events-none">
            ChadWallet
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight text-white">
            where traders become legends.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-secondary-text max-w-xl mx-auto leading-relaxed">
            From memecoins to viral tokens,<br />trade any crypto in seconds.
          </p>
          <div className="mt-8 mb-16 md:mb-24 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/trade"
              className="inline-flex items-center justify-center bg-[#5c67d6] hover:bg-[#4a55a2] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all"
            >
              Start trading
            </Link>
            <a
              href="#"
              className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl border border-white/10 transition-all"
            >
              Download app
            </a>
          </div>
        </div>

      </div>

      {/* Astronaut */}
      <div
        className="
          absolute
          left-1/2
          bottom-[-180px]
          -translate-x-1/2
          z-0
          pointer-events-none
        "
      >
        <img
          src="/flow/astronaut-mobile.webp"
          alt=""
          className="
            w-[500px]
            md:w-[500px]
            lg:w-[500px]
            object-contain
            animate-[float_6s_ease-in-out_infinite]
          "
        />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
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
