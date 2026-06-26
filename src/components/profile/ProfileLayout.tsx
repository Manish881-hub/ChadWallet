'use client';
import ProfileBanner from './ProfileBanner';
import ProfileHeader from './ProfileHeader';
import PortfolioSection from './PortfolioSection';
import TradesTable from './TradesTable';
import PositionsTable from './PositionsTable';

export default function ProfileLayout({ address }: { address?: string }) {
  return (
    <div className="flex flex-col w-full min-w-0 h-full overflow-y-auto scrollbar-thin">
      
      {/* Banner & Header */}
      <ProfileBanner />
      <ProfileHeader />

      {/* Main Content Sections */}
      <div className="flex flex-col xl:flex-row gap-4 p-4 sm:p-8 pt-6 max-w-5xl mx-auto w-full min-h-[500px]">
        
        {/* Left Column: Portfolio & Positions */}
        <div className="flex flex-col flex-1 min-w-0 xl:w-7/12 gap-4">
          <PortfolioSection />
          <PositionsTable />
        </div>

        {/* Right Column: Swaps / Trades */}
        <div className="flex flex-col flex-1 min-w-0 xl:w-5/12">
          <TradesTable />
        </div>
      </div>
      
    </div>
  );
}
