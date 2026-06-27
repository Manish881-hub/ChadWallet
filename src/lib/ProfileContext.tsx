'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

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
  updateProfile: (updates: Partial<ProfileState>) => Promise<void>;
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
  updateProfile: async () => {},
  loading: true,
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, ready, getAccessToken } = usePrivy();
  const walletAddress = user?.wallet?.address ?? null;
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const storageKey = walletAddress ? `fomo_profile_state:${walletAddress}` : 'fomo_profile_state';

    async function loadProfile() {
      try {
        const saved = localStorage.getItem(storageKey) ?? localStorage.getItem('fomo_profile_state');
        if (saved && !cancelled) {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
        }
      } catch (e) {
        console.error('Failed to load profile from local storage', e);
      }

      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profiles/${encodeURIComponent(walletAddress)}`);
        if (res.status === 404 || res.status === 503) return;
        if (!res.ok) throw new Error(`Profile fetch failed with ${res.status}`);

        const body = await res.json();
        if (!cancelled && body?.data) {
          const next = { ...DEFAULT_PROFILE, ...body.data };
          setProfile(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        }
      } catch (error) {
        console.warn('Failed to load Supabase profile; using local profile', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [ready, walletAddress]);

  const updateProfile = useCallback(async (updates: Partial<ProfileState>) => {
    const storageKey = walletAddress ? `fomo_profile_state:${walletAddress}` : 'fomo_profile_state';
    let nextProfile: ProfileState = DEFAULT_PROFILE;

    setProfile(prev => {
      const next = { ...prev, ...updates };
      nextProfile = next;
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });

    if (!walletAddress) return;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const res = await fetch(`/api/profiles/${encodeURIComponent(walletAddress)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(nextProfile),
      });

      if (!res.ok) throw new Error(`Profile save failed with ${res.status}`);
      const body = await res.json();
      if (body?.data) {
        const saved = { ...DEFAULT_PROFILE, ...body.data };
        setProfile(saved);
        localStorage.setItem(storageKey, JSON.stringify(saved));
      }
    } catch (error) {
      console.warn('Failed to save Supabase profile; kept local profile', error);
    }
  }, [getAccessToken, walletAddress]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}
