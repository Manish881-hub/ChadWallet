const features = [
  {
    label: 'LEADERBOARD',
    title: 'become a legend, top the leaderboard',
    image: '/appstore/kol.png',
    gradient: 'from-amber-500/20 to-transparent',
  },
  {
    label: 'FEED',
    title: 'discover and follow top traders',
    image: '/appstore/discover.png',
    gradient: 'from-blue-500/20 to-transparent',
  },
  {
    label: 'ALERTS',
    title: 'real time notifications for what the best are buying',
    image: '/appstore/x.png',
    gradient: 'from-purple-500/20 to-transparent',
  },
  {
    label: 'EASY ONBOARDING',
    title: 'create an account in an instant',
    image: '/appstore/splash.png',
    gradient: 'from-green-500/20 to-transparent',
  },
  {
    label: 'ZERO COMPLEXITY',
    title: 'multichain & gasless',
    image: '/appstore/token.png',
    gradient: 'from-cyan-500/20 to-transparent',
  },
  {
    label: 'ONE CLICK TO BUY',
    title: 'fund with apple pay',
    image: '/appstore/deposit.png',
    gradient: 'from-pink-500/20 to-transparent',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-left mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white">
            never miss out again
          </h2>
          <p className="mt-2 text-xl text-[#EAEDFF99]">
            the only social-first trading app
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="group relative rounded-[2.5rem] border border-white/5 bg-[#050816] hover:bg-[#080c24] hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(92,103,214,0.15)] hover:border-white/10 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer p-3 md:p-4"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              
              <div className="relative px-4 md:px-6 pt-6 pb-8 flex flex-col z-10">
                <div className="text-[#5c67d6] text-xs font-bold font-mono uppercase mb-3 tracking-widest">
                  {feature.label}
                </div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {feature.title}
                </h3>
              </div>
              
              <div className="relative z-10 mt-auto w-full h-full min-h-[300px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 shadow-[inset_0_2px_0_rgba(255,255,255,0.15)] pointer-events-none z-20 rounded-[2rem]" />
                <img 
                  src={feature.image} 
                  alt={feature.label} 
                  className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-[1.05]"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
