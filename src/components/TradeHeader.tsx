'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import SignInButton from './SignInButton';

export default function TradeHeader() {
  const { authenticated, user } = usePrivy();
  const [search, setSearch] = useState('');

  return (
    <header className="pr-4 py-2 border-b border-[rgba(255,255,255,.05)] bg-[#09090F]">
      <div className="flex items-center justify-between px-1">
        {/* Left Side - Logo */}
        <div className="flex gap-6 items-center min-w-0 flex-1">
          <Link href="/" className="flex items-center" data-discover="true">
            <img src="/logo/dark.png" alt="Logo" className="w-auto h-6 object-contain" />
          </Link>
        </div>

        {/* Center - Search Bar */}
        <div className="relative w-[320px] md:w-[400px] lg:w-[640px] min-w-[320px] h-12 mt-1 hidden sm:block">
          <div className="absolute top-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col">
            <div className="relative">
              <div className="relative z-10 flex flex-col">
                <div className="flex h-12 items-center gap-2 rounded-xl border border-[#1F2937] bg-[#12121B] hover:bg-[#1A1A24] px-3 cursor-text transition-colors">
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#6B7280]">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for tokens or traders..."
                        className="h-full min-w-0 flex-1 bg-transparent text-sm font-normal leading-none text-white outline-none placeholder:text-[#6B7280]"
                      />
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button type="button" className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#1F2937] text-[#9CA3AF] hover:text-white cursor-pointer transition-colors">
                      Paste
                    </button>
                    <div className="text-[10px] font-bold min-w-5 text-center px-1.5 py-0.5 rounded-sm bg-[#1F2937] text-[#9CA3AF]">
                      /
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - User Info & SignIn */}
        <div className="flex min-w-0 flex-1 justify-end">
          <nav aria-label="Main" data-orientation="horizontal" dir="ltr" className="relative flex max-w-max flex-1 items-center justify-center">
            <div style={{ position: 'relative' }}>
              <ul data-orientation="horizontal" className="flex-1 list-none justify-center flex gap-2 items-stretch" dir="ltr">
                {authenticated && user?.wallet?.address && (
                  <li className="relative flex shrink-0 flex-col items-start justify-center h-12 rounded-xl border border-[rgba(255,255,255,.05)] px-3">
                    <button className="group inline-flex items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 focus:opacity-80 text-sm">
                      <div className="flex gap-3 items-baseline tabular-nums">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">$0.00</span>
                          <span className="text-[#6B7280] text-xs">cash</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">$0.00</span>
                          <span className="text-[#6B7280] text-xs">--</span>
                        </div>
                      </div>
                    </button>
                    <button type="button" className="text-[#6366F1] hover:text-[#818CF8] text-xs font-bold hover:opacity-80 transition-colors">
                      Deposit more
                    </button>
                  </li>
                )}
                <li className="relative flex items-center justify-center shrink-0 rounded-xl h-12 hover:bg-[#12121B] px-2 py-1 border border-[rgba(255,255,255,.05)] bg-[#09090F]">
                  <SignInButton />
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
