'use client';
import { usePrivy } from '@privy-io/react-auth';

export default function SignInButton() {
  const { login, logout, authenticated, user } = usePrivy();

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">
          {user?.wallet?.address
            ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
            : 'Connected'}
        </span>
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 ring-1 ring-white/20 h-10 px-5 rounded-md font-medium text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-white/10 hover:bg-white/20 ring-1 ring-white/20 h-10 px-5 rounded-md font-medium text-sm transition-colors"
    >
      Login
    </button>
  );
}
