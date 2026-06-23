'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginWithOAuth } from '@privy-io/react-auth';
import { logger } from '@/lib/logger';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TRADE_ADDRESS = 'So11111111111111111111111111111111111111112';

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { initOAuth } = useLoginWithOAuth({
    onComplete: () => {
      onClose();
      router.push(`/trade/${DEFAULT_TRADE_ADDRESS}`);
    },
    onError: (error) => {
      logger.error('OAuth login error', { error });
    }
  });

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[400px] bg-[#050816] rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(92,103,214,0.3)] overflow-hidden animate-fade-up">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-[#5c67d6] opacity-30 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 p-8 pt-10 text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>

          {/* Logo & Text */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white tracking-tighter mb-4">
              ChadWallet
            </h2>
            <p className="text-gray-300 text-[15px] max-w-[240px] mx-auto leading-tight">
              Login or create an account to start trading.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={() => initOAuth({ provider: 'apple' })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl py-3.5 transition-colors"
            >
              <AppleIcon />
              Continue with Apple
            </button>

            <button
              onClick={() => initOAuth({ provider: 'google' })}
              className="w-full flex items-center justify-center gap-3 bg-[#0f111a] hover:bg-[#1a1d2d] border border-white/10 text-white font-semibold rounded-xl py-3.5 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-[#555a73] text-[11px] leading-relaxed max-w-[260px] mx-auto">
            By signing up, you agree to our Terms of Service<br />and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
