export default function DeviceShowcaseSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-visible z-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center justify-center">
          
          {/* Main Desktop Window */}
          <div className="relative w-full max-w-4xl group">
            {/* Ambient Glow behind the window */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#5c67d6]/30 via-[#2E3192]/40 to-[#5c67d6]/30 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            {/* Window Hardware Frame */}
            <div className="relative rounded-[2rem] border border-white/10 overflow-hidden bg-[#050816] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transform transition-transform duration-700 hover:-translate-y-2">
              
              {/* MacOS Top Bar */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
              </div>
              
              {/* Video Container */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                <video 
                  src="/video/chadwallet.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Screen Reflection/Glass Overlay */}
                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none" />
              </div>
            </div>

            {/* Mobile Phone Overlay */}
            <div className="absolute -bottom-12 -right-4 sm:-right-12 w-48 sm:w-64 rounded-[2.5rem] border-[6px] border-[#1a1c29] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black transform transition-transform duration-700 hover:-translate-y-6 hover:-rotate-2 hover:scale-105 z-30 cursor-pointer">
              <div className="relative aspect-[9/19] bg-black">
                {/* iPhone Dynamic Island / Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                  <div className="w-24 h-6 bg-[#1a1c29] rounded-b-2xl shadow-md" />
                </div>
                
                {/* Mobile UI Screenshot */}
                <img 
                  src="/appstore/portfolio.png" 
                  alt="Mobile Experience"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
