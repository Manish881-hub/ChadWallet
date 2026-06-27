import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProfileState } from '@/lib/ProfileContext';

export type ProfileRecord = {
  wallet_address: string;
  username: string;
  bio: string;
  twitter: string;
  website: string;
  avatar: string;
  banner: string;
  followers: number;
  following: number;
  trades_count: number;
  blur_balances: boolean;
};

export type ProfileInput = Partial<Omit<ProfileState, 'followers' | 'following' | 'tradesCount'>> &
  Partial<Pick<ProfileState, 'followers' | 'following' | 'tradesCount'>>;

export function toProfileState(record: ProfileRecord): ProfileState {
  return {
    avatar: record.avatar,
    banner: record.banner,
    username: record.username,
    bio: record.bio,
    twitter: record.twitter,
    website: record.website,
    followers: record.followers,
    following: record.following,
    tradesCount: record.trades_count,
    blurBalances: record.blur_balances,
  };
}

export function toProfileRecord(walletAddress: string, input: ProfileInput) {
  return {
    wallet_address: walletAddress,
    username: input.username,
    bio: input.bio,
    twitter: input.twitter,
    website: input.website,
    avatar: input.avatar,
    banner: input.banner,
    followers: input.followers,
    following: input.following,
    trades_count: input.tradesCount,
    blur_balances: input.blurBalances,
  };
}

export async function getProfile(walletAddress: string): Promise<ProfileState | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_address, username, bio, twitter, website, avatar, banner, followers, following, trades_count, blur_balances')
    .eq('wallet_address', walletAddress)
    .maybeSingle<ProfileRecord>();

  if (error) throw error;
  return data ? toProfileState(data) : null;
}

export async function upsertProfile(walletAddress: string, input: ProfileInput): Promise<ProfileState> {
  const supabase = createSupabaseServerClient();
  const payload = toProfileRecord(walletAddress, input);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'wallet_address' })
    .select('wallet_address, username, bio, twitter, website, avatar, banner, followers, following, trades_count, blur_balances')
    .single<ProfileRecord>();

  if (error) throw error;
  return toProfileState(data);
}
