'use client';
import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '@/lib/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SignInButton from '@/components/SignInButton';
import DepositModal from '@/components/modals/DepositModal';
import WithdrawModal from '@/components/modals/WithdrawModal';

export default function ProfileMenu() {
  const { authenticated, user, logout } = usePrivy();
  const { profile, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!authenticated) {
    return (
      <SignInButton compact />
    );
  }

  const avatarContent = profile.avatar ? (
    <img src={profile.avatar} alt="" width={28} height={28} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#FF4D4D] to-[#FF8080] flex items-center justify-center text-[10px] font-bold text-white">
      {profile.username.slice(0, 1).toUpperCase()}
    </div>
  );

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close user menu' : 'Open user menu'}
        aria-expanded={isOpen}
        aria-haspopup={true}
        className="touch-target w-7 h-7 rounded-full bg-[#111111] border border-[#1F1F1F] flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#4D62FF]/50 transition-all focus:outline-none"
      >
        {avatarContent}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-2 w-56 bg-[#111111] border border-[#1F1F1F] rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-3 border-b border-[#1F1F1F] flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#1F1F1F] overflow-hidden shrink-0">
                 {avatarContent}
               </div>
               <div className="flex flex-col min-w-0">
                 <span className="text-sm font-bold text-white truncate">{profile.username}</span>
                 <span className="text-[10px] text-[#A0A0A0] font-mono truncate">
                   {user?.wallet?.address ? `${user.wallet.address.slice(0,6)}...${user.wallet.address.slice(-4)}` : '@StaleFreshMacaw'}
                 </span>
               </div>
            </div>

            <div className="p-1 flex flex-col" role="menu">
              <Link href="/profile/me" onClick={() => setIsOpen(false)} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </Link>
              <button onClick={() => {
                if (user?.wallet?.address) {
                  navigator.clipboard.writeText(user.wallet.address);
                }
                setIsOpen(false);
              }} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white w-full text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {user?.wallet?.address ? `Copy wallet` : 'Wallet'}
              </button>
              <div className="h-px bg-[#1F1F1F] my-1 mx-2" role="separator" />
              <button onClick={() => { setIsOpen(false); setDepositOpen(true); }} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white w-full text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                Deposit
              </button>
              <button onClick={() => { setIsOpen(false); setWithdrawOpen(true); }} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white w-full text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                Withdraw
              </button>
              <div className="h-px bg-[#1F1F1F] my-1 mx-2" role="separator" />
              <button onClick={() => {
                updateProfile({ blurBalances: !profile.blurBalances });
              }} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white w-full text-left justify-between">
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Blur Balances
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${profile.blurBalances ? 'bg-[#39FF14]' : 'bg-[#333]'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${profile.blurBalances ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
              <button onClick={() => setIsOpen(false)} role="menuitem" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-[#E0E0E0] hover:text-white w-full text-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </button>
              <button 
                onClick={() => { logout(); setIsOpen(false); }} 
                role="menuitem"
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#FF1744]/10 text-[#FF1744] rounded-lg transition-colors text-sm w-full text-left mt-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}
