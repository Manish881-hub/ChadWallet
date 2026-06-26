import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TokenBanner from '@/components/TokenBanner';
import WebAvailableSection from '@/components/WebAvailableSection';
import DeviceShowcaseSection from '@/components/DeviceShowcaseSection';
import FeaturesSection from '@/components/FeaturesSection';
import CommunitySection from '@/components/CommunitySection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />

      {/* ── Shared aurora band: all content sections ──────────────────── */}
      <div className="relative">
        {/* Aurora background — spans the full height of all sections */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            zIndex: 0,
            backgroundImage: 'url(/landingpage/aurora.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.72,
            mixBlendMode: 'screen',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        />
        <HeroSection />
        <WebAvailableSection />
        <DeviceShowcaseSection />
        <FeaturesSection />
        <CommunitySection />
      </div>

      <Footer />
    </main>
  );
}
