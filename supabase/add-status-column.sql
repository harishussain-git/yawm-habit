alter table public.daily_habit_checks
add column if not exists status text null
check (status in ('yes', 'no'));

update public.daily_habit_checks
set status = case
  when checked = true then 'yes'
  else null
end
where status is null;

create index if not exists daily_habit_checks_user_date_status_idx
on public.daily_habit_checks (user_id, date, status);
