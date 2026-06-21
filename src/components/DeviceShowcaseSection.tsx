export default function DeviceShowcaseSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-card shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-black/30">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0D1A] via-[#0F1325] to-[#0A0D1A] flex items-center justify-center p-6">
                <div className="w-full h-full rounded-lg border border-white/5 bg-[#050816] p-4">
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">CW</div>
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-white/10 rounded" />
                      <div className="h-2 w-16 bg-white/5 rounded mt-1.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-12 rounded bg-white/5 border border-white/5" />
                    ))}
                  </div>
                  <div className="h-32 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center">
                    <div className="flex items-end gap-1 h-16">
                      {[40,60,35,70,45,80,55,90,65,75,50,85].map((h, i) => (
                        <div
                          key={i}
                          className="w-3 bg-primary/40 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 w-48 sm:w-64 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl bg-card">
              <div className="aspect-[9/19] bg-gradient-to-b from-[#0A0D1A] to-[#050816] p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[6px] text-primary">CW</div>
                  <div className="h-1.5 w-12 bg-white/10 rounded" />
                </div>
                <div className="flex-1 rounded bg-white/[0.02] border border-white/5 p-2">
                  <div className="h-1.5 w-16 bg-white/10 rounded mb-2" />
                  <div className="h-1.5 w-10 bg-green-400/30 rounded" />
                </div>
                <div className="flex-1 rounded bg-white/[0.02] border border-white/5 p-2">
                  <div className="h-1.5 w-14 bg-white/10 rounded mb-2" />
                  <div className="h-1.5 w-8 bg-red-400/30 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
