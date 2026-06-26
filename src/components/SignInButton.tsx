'use client';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import LoginModal from './LoginModal';

export default function SignInButton({ compact }: { compact?: boolean }) {
  const { logout, authenticated, user } = usePrivy();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">
          {user?.wallet?.address
            ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
            : 'Connected'}
        </span>
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 ring-1 ring-white/20 h-10 px-5 rounded-md font-medium text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`bg-white/10 hover:bg-white/20 ring-1 ring-white/20 rounded-md font-medium text-sm transition-colors ${
          compact ? 'w-7 h-7 flex items-center justify-center text-[10px] px-0' : 'h-10 px-5'
        }`}
      >
        {compact ? '?' : 'Login'}
      </button>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

