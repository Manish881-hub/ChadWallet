'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ProfileState {
  avatar: string;
  banner: string;
  username: string;
  bio: string;
  twitter: string;
  website: string;
  followers: number;
  following: number;
  tradesCount: number;
  blurBalances: boolean;
}

interface ProfileContextType {
  profile: ProfileState;
  updateProfile: (updates: Partial<ProfileState>) => void;
  loading: boolean;
}

const DEFAULT_PROFILE: ProfileState = {
  avatar: '',
  banner: '',
  username: 'StaleFreshMacaw',
  bio: 'Just another degen apeing into solana memecoins. WAGMI.',
  twitter: '',
  website: '',
  followers: 124,
  following: 89,
  tradesCount: 42,
  blurBalances: false,
};

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  loading: true,
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fomo_profile_state');
      if (saved) {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load profile from local storage', e);
    }
    setLoading(false);
  }, []);

  const updateProfile = useCallback((updates: Partial<ProfileState>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('fomo_profile_state', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}
