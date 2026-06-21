const placeholderTokens = [
  { symbol: 'SOL', price: '168.42', change: '+5.2%' },
  { symbol: 'BONK', price: '0.000034', change: '+12.8%' },
  { symbol: 'WIF', price: '2.84', change: '+8.1%' },
];

export default function WebAvailableSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-flex items-center gap-2 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            Now Available on Web
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white max-w-3xl">
            trade from anywhere.
            <br />
            never lose a beat.
          </h2>
          <p className="mt-5 text-lg text-secondary-text max-w-xl">
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
            <div className="aspect-[16/10] bg-gradient-to-br from-[#0A0D1A] via-[#0F1325] to-[#0A0D1A] flex items-center justify-center p-8">
              <div className="w-full h-full rounded-lg border border-white/5 bg-[#050816] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
                    {placeholderTokens.map((t) => (
                      <div key={t.symbol} className="bg-card rounded-lg p-3 border border-white/5">
                        <div className="text-xs text-muted">{t.symbol}</div>
                        <div className="text-sm font-semibold text-white mt-1">${t.price}</div>
                        <div className="text-xs text-green-400">{t.change}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted">ChadWallet Trading Terminal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
