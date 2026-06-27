'use client';
import { useParams } from 'next/navigation';
import { SidebarProvider, TokenProvider } from '@/lib/TokenContext';
import TradeHeader from '@/components/TradeHeader';
import ActivitySidebar from '@/components/ActivitySidebar';
import FollowSidebar from '@/components/FollowSidebar';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
  const params = useParams<{ address: string }>();
  const address = params?.address ?? '';

  return (
    <TokenProvider>
        <SidebarProvider>
          <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden">
            <TradeHeader />
            <div className="flex-1 flex min-h-0">
              <ActivitySidebar />
              <ProfileLayout address={address} />
              <FollowSidebar />
            </div>
          </div>
        </SidebarProvider>
    </TokenProvider>
  );
}
