import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WebAvailableSection from '@/components/WebAvailableSection';
import DeviceShowcaseSection from '@/components/DeviceShowcaseSection';
import FeaturesSection from '@/components/FeaturesSection';
import CommunitySection from '@/components/CommunitySection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <WebAvailableSection />
      <DeviceShowcaseSection />
      <FeaturesSection />
      <CommunitySection />
      <Footer />
    </main>
  );
}
