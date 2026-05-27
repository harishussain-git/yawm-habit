update public.habits
set is_active = false;

insert into public.habits (id, title, icon_key, sort_order, is_active)
values
  ('wake-before-fajr', 'Tahajjud', 'masjid', 1, true),
  ('fajr-in-masjid', 'Fajr in masjid', 'masjid', 2, true),
  ('dhuhr-in-masjid', 'Dhuhr in masjid', 'masjid', 3, true),
  ('asr-in-masjid', 'Asr in masjid', 'masjid', 4, true),
  ('maghrib-in-masjid', 'Maghrib in masjid', 'masjid', 5, true),
  ('isha-in-masjid', 'Isha in masjid', 'masjid', 6, true),
  ('quran-hadith-learning', 'Qur’an & Hadith learning', 'book', 7, true),
  ('exercise-gym', 'Exercise', 'gym', 8, true)
on conflict (id) do update
set
  title = excluded.title,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = true;

create table if not exists public.remember_items (
  id text primary key,
  title text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.remember_items enable row level security;

drop policy if exists "Allow active remember items read" on public.remember_items;

create policy "Allow active remember items read"
on public.remember_items
for select
using (is_active = true);

update public.remember_items
set is_active = false;

insert into public.remember_items (id, title, sort_order, is_active)
values
  ('eat-healthy-foods', 'Eat healthy foods', 1, true),
  ('control-tongue', 'Control tongue: no gossip, anger, useless talk', 2, true),
  ('avoid-useless-digital-screen-time', 'Avoid useless digital screen time', 3, true)
on conflict (id) do update
set
  title = excluded.title,
  sort_order = excluded.sort_order,
  is_active = true;
