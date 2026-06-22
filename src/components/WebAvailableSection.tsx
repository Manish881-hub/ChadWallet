export default function WebAvailableSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="font-mono font-bold text-[#5c67d6] mb-4">
            NOW AVAILABLE ON WEB
          </div>
          <h2 className="text-[48px] md:text-[60px] font-bold tracking-tight leading-[1.1] text-white text-center">
            trade from anywhere.<br />never lose a beat.
          </h2>
          <p className="mt-5 text-[#CAE8FF]/60 text-[18px] md:text-[22px] tracking-tight max-w-xl">
            Open a trade on your phone, close it on your desktop — all in one app.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl blur-3xl opacity-60" />
          <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-card shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-black/30">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-muted font-medium">app.chadwallet.xyz</span>
            </div>
            <img
              src="/flow/buy-sell-4.png"
              alt="ChadWallet trading interface"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
