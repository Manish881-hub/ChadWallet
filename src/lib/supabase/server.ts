import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string;
};

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseServerConfig() !== null;
}

export function createSupabaseServerClient(): SupabaseClient {
  const config = getSupabaseServerConfig();
  if (!config) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  cachedClient ??= createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
