create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  user_code text not null unique,
  display_name text not null,
  role text not null check (role in ('me', 'partner')),
  pin text not null,
  avatar_url text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_users enable row level security;

drop policy if exists "Allow public login lookup" on public.app_users;

create policy "Allow public login lookup"
on public.app_users
for select
using (is_active = true);

insert into public.app_users (user_code, display_name, role, pin, avatar_url)
values
  ('shafi', 'Shafi', 'me', '1234', null),
  ('hashim', 'Hashim', 'partner', '1234', null)
on conflict (user_code) do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  pin = excluded.pin,
  avatar_url = excluded.avatar_url,
  is_active = true,
  updated_at = now();