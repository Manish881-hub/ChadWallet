export default function WebAvailableSection() {
  return (
    <>
      {/* Mobile Layout */}
      <section className="flex md:hidden relative text-center w-full z-10 flex-col pt-4 pb-0">
        <div className="w-full flex flex-col gap-4 mb-2 px-6 relative z-20">
          <div className="font-mono font-bold text-[#5c67d6] tracking-widest uppercase text-[10px]">
            Now Available on Web
          </div>
          <h2 className="text-[36px] font-bold leading-[1.05] tracking-tighter text-white text-center">
            trade from anywhere.<br />never lose a beat.
          </h2>
          <p className="tracking-tight text-[#A4A9C6] leading-relaxed text-[16px]">
            Open a trade on your phone, close it on your desktop — all in one app.
          </p>
        </div>

        <div className="relative w-full -mt-6">
          <img
            alt="Mobile App"
            loading="lazy"
            src="/appstore/search.png"
            className="w-full h-auto object-cover relative z-0"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px, black calc(100% - 120px), transparent 100%)'
            }}
          />
        </div>
      </section>

      {/* Desktop Layout */}
      <section className="hidden md:flex relative py-16 md:py-24 px-6 overflow-visible z-10 w-full flex-col items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="font-mono font-bold text-[#5c67d6] mb-4 tracking-widest uppercase text-sm">
              Now Available on Web
            </div>
            <h2 className="text-[56px] lg:text-[72px] font-bold tracking-tighter leading-[1.05] text-white text-center">
              trade from anywhere.<br />never lose a beat.
            </h2>
            <p className="mt-6 text-[#A4A9C6] text-[22px] tracking-tight max-w-2xl font-medium">
              Open a trade on your phone, close it on your desktop — all in one app.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl group">
            {/* Ambient Glow behind the window */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            {/* Window Hardware Frame */}
            <div className="relative rounded-[2rem] border border-white/10 overflow-hidden bg-[#050816] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transform transition-transform duration-700 hover:-translate-y-2 cursor-pointer">

              {/* MacOS Top Bar */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
                <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Screen Container */}
              <div className="relative bg-[#050816] overflow-hidden">
                <img
                  src="/flow/buy-sell-4.png"
                  alt="ChadWallet Web Interface"
                  className="w-full h-auto transform transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {/* Liquid Glass Overlay */}
                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
