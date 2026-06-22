export default function WebAvailableSection() {
  return (
    <>
      {/* Mobile Layout */}
      <section className="flex md:hidden relative text-center w-full z-10 flex-col -mt-8">
        <img 
          alt="Mobile App" 
          loading="lazy" 
          src="/appstore/search.png" 
          className="w-full h-auto object-cover relative z-0" 
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}
        />
        <div className="w-full px-8 flex flex-col gap-4 pb-12 -mt-12 relative z-10">
          <h2 className="text-[36px] font-bold leading-9 tracking-tighter text-white text-center">
            trade from anywhere.<br />never lose a beat.
          </h2>
          <p className="tracking-tight text-secondary-text leading-5 text-[18px]">
            Open a trade on your phone, close it on your desktop — all in one app.
          </p>
        </div>
      </section>

      {/* Desktop Layout */}
      <section className="hidden md:flex relative py-8 md:py-10 px-6 overflow-hidden z-10 w-full flex-col items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="font-mono font-bold text-[#5c67d6] mb-4">
              NOW AVAILABLE ON WEB
            </div>
            <h2 className="text-[60px] font-bold tracking-tight leading-[1.1] text-white text-center">
              trade from anywhere. never lose a beat.
            </h2>
            <p className="mt-5 text-[#EAEDFF99] text-[22px] tracking-tight max-w-3xl">
              Open a trade on your phone, close it on your desktop — all in one app.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl blur-3xl opacity-60" />
            <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-card shadow-2xl">
              <img
                src="/flow/buy-sell-4.png"
                alt="ChadWallet trading interface"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
