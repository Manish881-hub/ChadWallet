'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function ProfileMeRedirect() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();

  useEffect(() => {
    if (!ready) return;
    if (authenticated && user?.wallet?.address) {
      router.replace(`/profile/${user.wallet.address}`);
    } else {
      router.replace('/profile/StaleFreshMacaw');
    }
  }, [ready, authenticated, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="w-8 h-8 border-4 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin" />
    </div>
  );
}
