'use client';
import { useProfile } from '@/lib/ProfileContext';

export default function ProfileBanner() {
  const { profile } = useProfile();

  return (
    <div className="w-full h-32 md:h-48 bg-[#111111] relative overflow-hidden shrink-0 border-b border-[#1F1F1F]">
      {profile.banner ? (
        <img 
          src={profile.banner} 
          alt="Profile Banner" 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D4D]/20 to-[#FF8080]/10 flex items-center justify-center">
           <svg viewBox="0 0 24 24" className="w-12 h-12 text-[#333]" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      )}
      
      {/* Gradient overlay for blending into content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
    </div>
  );
}
