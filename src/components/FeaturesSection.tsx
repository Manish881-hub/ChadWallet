const features = [
  {
    title: 'Leaderboard',
    description: 'become a legend, top the leaderboard',
    gradient: 'from-amber-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C6.5 4 8 6 8 9m0 0v6m0-6H8m6-4v10m0 0v2m0-2h2m-2 0H8m4-10V3m0 3h2m-2 3h4m0 0 2 4m-2-4h-2" />
      </svg>
    ),
  },
  {
    title: 'Feed',
    description: 'discover and follow top traders',
    gradient: 'from-blue-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: 'Alerts',
    description: 'real time notifications for what the best are buying',
    gradient: 'from-purple-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    title: 'Easy Onboarding',
    description: 'create an account in an instant',
    gradient: 'from-green-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    title: 'Zero Complexity',
    description: 'multichain & gasless',
    gradient: 'from-cyan-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    title: 'One Click to Buy',
    description: 'fund with apple pay',
    gradient: 'from-pink-500/20 to-transparent',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white">
            never miss out again
          </h2>
          <p className="mt-4 text-xl text-secondary-text">
            the only social-first trading app
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-white/5 bg-card hover:bg-white/[0.03] transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-secondary-text">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
