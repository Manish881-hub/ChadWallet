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
          className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl font-bold transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold transition-colors"
    >
      Sign In
    </button>
  );
}
