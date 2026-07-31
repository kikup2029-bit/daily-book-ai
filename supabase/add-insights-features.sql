-- SimpleBooks AI — adds products/margins, cash drawer counts, settings
-- (tax rate + till float), and a payment method on entries.
-- Paste this whole file into the Supabase SQL Editor and click Run once.

-- 1. Payment method on entries (for cash drawer reconciliation) -----------
alter table public.entries add column if not exists payment_method text;

-- 2. Products (for margin / break-even maths) -----------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  unit_cost numeric not null default 0,
  sale_price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

drop policy if exists "Users can read their own products" on public.products;
drop policy if exists "Users can add their own products" on public.products;
drop policy if exists "Users can update their own products" on public.products;
drop policy if exists "Users can delete their own products" on public.products;

create policy "Users can read their own products" on public.products
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can add their own products" on public.products
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own products" on public.products
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own products" on public.products
  for delete to authenticated using (auth.uid() = user_id);

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at_column();

-- 3. Cash drawer counts ---------------------------------------------------
create table if not exists public.cash_counts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  count_date date not null default current_date,
  counted_amount numeric not null default 0,
  opening_float numeric not null default 0,
  expected_amount numeric not null default 0,
  difference numeric not null default 0,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, count_date)
);

grant select, insert, update, delete on public.cash_counts to authenticated;
grant all on public.cash_counts to service_role;
alter table public.cash_counts enable row level security;

drop policy if exists "Users can read their own counts" on public.cash_counts;
drop policy if exists "Users can add their own counts" on public.cash_counts;
drop policy if exists "Users can update their own counts" on public.cash_counts;
drop policy if exists "Users can delete their own counts" on public.cash_counts;

create policy "Users can read their own counts" on public.cash_counts
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can add their own counts" on public.cash_counts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own counts" on public.cash_counts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own counts" on public.cash_counts
  for delete to authenticated using (auth.uid() = user_id);

-- 4. Per-user settings (tax rate, till float) -----------------------------
create table if not exists public.user_settings (
  user_id uuid primary key,
  tax_rate_percent numeric not null default 0,
  opening_float numeric not null default 0,
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.user_settings to authenticated;
grant all on public.user_settings to service_role;
alter table public.user_settings enable row level security;

drop policy if exists "Users can read their own settings" on public.user_settings;
drop policy if exists "Users can add their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings" on public.user_settings;

create policy "Users can read their own settings" on public.user_settings
  for select to authenticated using (auth.uid() = user_id);
create policy "Users can add their own settings" on public.user_settings
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own settings" on public.user_settings
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists update_user_settings_updated_at on public.user_settings;
create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.update_updated_at_column();
