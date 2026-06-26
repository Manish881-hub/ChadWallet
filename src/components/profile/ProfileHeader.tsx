'use client';
import { useState, useEffect } from 'react';
import { useProfile } from '@/lib/ProfileContext';
import EditProfileModal from './EditProfileModal';
import { usePrivy } from '@privy-io/react-auth';

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(ease * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}</span>;
}

export default function ProfileHeader() {
  const { profile } = useProfile();
  const { authenticated, user } = usePrivy();
  const [editOpen, setEditOpen] = useState(false);

  const displayHandle = authenticated && user?.wallet?.address && !profile.username
    ? `@${user.wallet.address.slice(0, 6)}`
    : `@${profile.username.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div className="relative px-4 sm:px-8 -mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10 w-full max-w-5xl mx-auto">
      
      {/* Left: Avatar & Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0A0A0A] bg-[#111111] overflow-hidden shrink-0 flex items-center justify-center">
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FF4D4D] to-[#FF8080] flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {profile.username}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[#A0A0A0] text-sm">{displayHandle}</span>
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="text-[#555] hover:text-[#1DA1F2] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-[#555] hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </a>
            )}
          </div>
          {profile.bio && (
            <p className="text-sm text-[#E0E0E0] mt-2 max-w-md">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Right: Stats & Edit Button */}
      <div className="flex flex-col sm:items-end gap-3 mb-2 w-full sm:w-auto">
        <div className="flex items-center gap-6 text-center sm:text-right w-full sm:w-auto">
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-xl font-bold text-white leading-none">
              <AnimatedCounter value={profile.following} />
            </span>
            <span className="text-[11px] text-[#A0A0A0]">Following</span>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-xl font-bold text-white leading-none">
              <AnimatedCounter value={profile.followers} />
            </span>
            <span className="text-[11px] text-[#A0A0A0]">Followers</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 w-full sm:w-auto">
          <button 
            onClick={() => setEditOpen(true)}
            className="flex-1 sm:flex-none px-6 py-2 border border-[#1F1F1F] bg-[#111111] hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"
          >
            Edit profile
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-[#1F1F1F] bg-[#111111] hover:bg-white/5 rounded-lg transition-colors shrink-0">
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12"/><path d="M19 8c-2 0-3.5-1.5-3.5-3.5S17 1 19 1s3.5 1.5 3.5 3.5S21 8 19 8z"/><path d="M5 8c2 0 3.5-1.5 3.5-3.5S7 1 5 1 1.5 2.5 1.5 4.5 3 8 5 8z"/>
             </svg>
          </button>
        </div>
      </div>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
