import { MOCK_TRADERS } from '@/lib/mock/profileData';

export interface TrendingProfile {
  name: string;
  handle: string;
  avatar: string;
  winRate: string;
}

/**
 * In the future, this will be an API call to Supabase or our backend:
 * const res = await fetch('/api/profiles/trending');
 * return res.json();
 */
export async function getTrendingProfiles(): Promise<TrendingProfile[]> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return MOCK_TRADERS;
}
