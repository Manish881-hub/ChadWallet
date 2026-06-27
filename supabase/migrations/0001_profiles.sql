create extension if not exists pgcrypto;

create table if not exists public.profiles (
  wallet_address text primary key,
  username text not null default 'StaleFreshMacaw',
  bio text not null default 'Just another degen apeing into solana memecoins. WAGMI.',
  twitter text not null default '',
  website text not null default '',
  avatar text not null default '',
  banner text not null default '',
  followers integer not null default 0 check (followers >= 0),
  following integer not null default 0 check (following >= 0),
  trades_count integer not null default 0 check (trades_count >= 0),
  blur_balances boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_updated_at on public.profiles(updated_at desc);
create index if not exists idx_profiles_username on public.profiles(username);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "profiles are not directly writable by anon users" on public.profiles;
create policy "profiles are not directly writable by anon users"
on public.profiles
for all
using (false)
with check (false);
