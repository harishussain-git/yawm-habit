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
  ('haris', 'Haris', 'me', '1234', '/avatars/haris.webp'),
  ('hashim', 'Hashim', 'partner', '1234', '/avatars/hashim.webp')
on conflict (user_code) do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  pin = excluded.pin,
  avatar_url = excluded.avatar_url,
  is_active = true,
  updated_at = now();

create table if not exists public.habits (
  id text primary key,
  title text not null,
  icon_key text null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_habit_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  habit_id text not null references public.habits(id) on delete cascade,
  date date not null,
  checked boolean not null default false,
  checked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint daily_habit_checks_unique unique (user_id, habit_id, date)
);

create index if not exists daily_habit_checks_user_date_idx
on public.daily_habit_checks (user_id, date);

alter table public.habits enable row level security;
alter table public.daily_habit_checks enable row level security;

drop policy if exists "Allow active habits read" on public.habits;
create policy "Allow active habits read"
on public.habits
for select
using (is_active = true);

drop policy if exists "Allow daily checks read" on public.daily_habit_checks;
create policy "Allow daily checks read"
on public.daily_habit_checks
for select
using (true);

drop policy if exists "Allow daily checks insert" on public.daily_habit_checks;
create policy "Allow daily checks insert"
on public.daily_habit_checks
for insert
with check (true);

drop policy if exists "Allow daily checks update" on public.daily_habit_checks;
create policy "Allow daily checks update"
on public.daily_habit_checks
for update
using (true)
with check (true);

insert into public.habits (id, title, icon_key, sort_order)
values
  ('wake-before-fajr', 'Wake before Fajr / Tahajjud', 'sunrise', 1),
  ('fajr-in-masjid', 'Fajr in masjid', 'masjid', 2),
  ('dhuhr-in-masjid', 'Dhuhr in masjid', 'sun', 3),
  ('quran-hadith-learning', 'Qur’an & Hadith learning', 'book', 4),
  ('walk-exercise', 'Walk / exercise', 'walk', 5)
on conflict (id) do update
set
  title = excluded.title,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = true;
