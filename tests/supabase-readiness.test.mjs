import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('documents required Supabase environment variables', () => {
  const envExample = read('.env.example');

  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(envExample, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/);
  assert.match(envExample, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(envExample, /PRIVY_APP_SECRET=/);
});

test('provides a Supabase profile schema migration with RLS', () => {
  const migrationPath = 'supabase/migrations/0001_profiles.sql';

  assert.equal(existsSync(migrationPath), true);
  const sql = read(migrationPath);

  assert.match(sql, /create table if not exists public\.profiles/i);
  assert.match(sql, /wallet_address text primary key/i);
  assert.match(sql, /alter table public\.profiles enable row level security/i);
  assert.match(sql, /create policy "profiles are readable by everyone"/i);
});

test('exposes server-side Supabase wiring and profile API route', () => {
  assert.equal(existsSync('src/lib/supabase/server.ts'), true);
  assert.equal(existsSync('src/lib/privyServer.ts'), true);
  assert.equal(existsSync('src/lib/profile/profileRepository.ts'), true);
  assert.equal(existsSync('src/app/api/profiles/[address]/route.ts'), true);
  assert.equal(existsSync('src/app/api/health/route.ts'), true);
});
