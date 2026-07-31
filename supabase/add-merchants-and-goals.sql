-- SimpleBooks AI — adds merchant tracking and savings goals.
-- Paste this whole file into the Supabase SQL Editor and click Run once.

-- 1. Merchant on entries -------------------------------------------------
alter table public.entries add column if not exists merchant text;
create index if not exists entries_merchant_idx on public.entries (merchant);

-- 2. Savings goals --------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  target_amount numeric not null default 0,
  saved_amount numeric not null default 0,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.savings_goals to authenticated;
grant all on public.savings_goals to service_role;
alter table public.savings_goals enable row level security;

drop policy if exists "Users can read their own goals" on public.savings_goals;
drop policy if exists "Users can add their own goals" on public.savings_goals;
drop policy if exists "Users can update their own goals" on public.savings_goals;
drop policy if exists "Users can delete their own goals" on public.savings_goals;

create policy "Users can read their own goals" on public.savings_goals
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can add their own goals" on public.savings_goals
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own goals" on public.savings_goals
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own goals" on public.savings_goals
  for delete to authenticated using (auth.uid() = user_id);

drop trigger if exists update_savings_goals_updated_at on public.savings_goals;
create trigger update_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.update_updated_at_column();
