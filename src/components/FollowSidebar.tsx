'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTrendingProfiles, TrendingProfile } from '@/lib/profile/getTrendingProfiles';

export default function FollowSidebar() {
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [profiles, setProfiles] = useState<TrendingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getTrendingProfiles().then((data) => {
      if (mounted) {
        setProfiles(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const toggleFollow = (name: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <aside className="hidden md:flex flex-col w-[320px] min-w-[320px] border-l border-[#1F1F1F] bg-[#0A0A0A] overflow-y-auto scrollbar-thin">
      <div className="p-4 border-b border-[#1F1F1F]">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-wider">Trending Traders</h2>
      </div>
      
      <div className="flex flex-col gap-1 p-2">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full skeleton" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-24 h-3 skeleton rounded" />
                  <div className="w-16 h-2 skeleton rounded" />
                </div>
              </div>
              <div className="w-16 h-7 skeleton rounded" />
            </div>
          ))
        ) : (
          profiles.map((user, i) => {
            const isFollowing = following.has(user.name);
            return (
              <Link 
                key={i} 
                href={`/profile/${user.name}`}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full bg-[#1F1F1F] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-white leading-tight truncate">{user.name}</span>
                    <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                      <span className="text-[#A0A0A0] truncate">{user.handle}</span>
                      <span className="text-[#555]">•</span>
                      <span className="text-[#39FF14] font-bold">{user.winRate} win</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFollow(user.name);
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded transition-all press-scale shrink-0 ${
                    isFollowing 
                      ? 'bg-white/10 text-white hover:bg-[#FF1744]/20 hover:text-[#FF1744] hover:border-[#FF1744]/30' 
                      : 'bg-[#4D62FF] hover:bg-[#3D52E5] text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
