import { getProfile, upsertProfile, type ProfileInput } from '@/lib/profile/profileRepository';
import { requirePrivyWallet } from '@/lib/privyServer';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ProfileRouteContext = {
  params: Promise<{ address: string }>;
};

const editableFields = new Set([
  'avatar',
  'banner',
  'username',
  'bio',
  'twitter',
  'website',
  'followers',
  'following',
  'tradesCount',
  'blurBalances',
]);

function problem(status: number, title: string, detail: string) {
  return Response.json({ title, status, detail }, { status });
}

function normalizeAddress(address: string): string {
  return decodeURIComponent(address).trim();
}

function sanitizeProfileInput(body: unknown): ProfileInput | null {
  if (!body || typeof body !== 'object') return null;

  const input: ProfileInput = {};
  for (const [key, value] of Object.entries(body)) {
    if (!editableFields.has(key)) continue;

    if (typeof value === 'string') {
      if (key === 'username') input.username = value.trim().slice(0, 40);
      if (key === 'bio') input.bio = value.trim().slice(0, 280);
      if (key === 'twitter') input.twitter = value.replace(/^@/, '').trim().slice(0, 40);
      if (key === 'website') input.website = value.trim().slice(0, 200);
      if (key === 'avatar') input.avatar = value;
      if (key === 'banner') input.banner = value;
    }

    if (typeof value === 'boolean' && key === 'blurBalances') input.blurBalances = value;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
      if (key === 'followers') input.followers = value;
      if (key === 'following') input.following = value;
      if (key === 'tradesCount') input.tradesCount = value;
    }
  }

  return input;
}

export async function GET(_request: Request, context: ProfileRouteContext) {
  if (!isSupabaseConfigured()) {
    return problem(503, 'Supabase Not Configured', 'Set Supabase environment variables to enable profile persistence.');
  }

  const { address } = await context.params;
  const walletAddress = normalizeAddress(address);
  if (!walletAddress) return problem(422, 'Validation Error', 'Profile address is required.');

  const profile = await getProfile(walletAddress);
  if (!profile) return problem(404, 'Profile Not Found', 'No profile exists for this wallet address.');

  return Response.json({ data: profile });
}

export async function PUT(request: Request, context: ProfileRouteContext) {
  if (!isSupabaseConfigured()) {
    return problem(503, 'Supabase Not Configured', 'Set Supabase environment variables to enable profile persistence.');
  }

  const { address } = await context.params;
  const walletAddress = normalizeAddress(address);

  if (!walletAddress) return problem(422, 'Validation Error', 'Profile address is required.');

  const authorization = await requirePrivyWallet(request, walletAddress);
  if (!authorization.ok) {
    return problem(authorization.status, authorization.title, authorization.detail);
  }

  const body = await request.json().catch(() => null);
  const input = sanitizeProfileInput(body);
  if (!input) return problem(422, 'Validation Error', 'Profile payload must be a JSON object.');

  const profile = await upsertProfile(walletAddress, input);
  return Response.json({ data: profile });
}
