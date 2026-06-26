'use client';
import { SidebarProvider, TokenProvider } from '@/lib/TokenContext';
import { ProfileProvider } from '@/lib/ProfileContext';
import TradeHeader from '@/components/TradeHeader';
import ActivitySidebar from '@/components/ActivitySidebar';
import FollowSidebar from '@/components/FollowSidebar';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage({ params }: { params: { address: string } }) {
  // In a real app we would pass params.address into ProfileProvider or ProfileLayout
  // to fetch and display that specific user's data.
  // For this demo, we'll just render the global profile or mock if it's someone else.
  
  return (
    <TokenProvider>
      <ProfileProvider>
        <SidebarProvider>
          <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
            <TradeHeader />
            <div className="flex-1 flex min-h-0">
              <ActivitySidebar />
              <ProfileLayout address={params.address} />
              <FollowSidebar />
            </div>
          </div>
        </SidebarProvider>
      </ProfileProvider>
    </TokenProvider>
  );
}
