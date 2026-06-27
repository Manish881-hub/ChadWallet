import { isSupabaseConfigured, createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ready = url.searchParams.get('ready') === '1';
  const checks: Record<string, { status: 'ok' | 'missing' | 'error'; message?: string }> = {
    supabase: { status: isSupabaseConfigured() ? 'ok' : 'missing' },
  };

  if (ready && checks.supabase.status === 'ok') {
    try {
      await createSupabaseServerClient().from('profiles').select('wallet_address', { count: 'exact', head: true });
    } catch (error) {
      checks.supabase = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Supabase readiness check failed',
      };
    }
  }

  const healthy = Object.values(checks).every((check) => check.status === 'ok');

  return Response.json(
    {
      status: healthy ? 'ok' : ready ? 'degraded' : 'ok',
      checks,
    },
    { status: healthy || !ready ? 200 : 503 },
  );
}
