-- Invoices: money you're owed.
--
-- Run this once in the Supabase SQL Editor. It's safe to run twice.
--
-- Design note worth keeping: an invoice is not income until it's paid. Marking
-- one paid creates a row in `entries` and stores its id here, so the books and
-- the invoice can never disagree about whether the money arrived. Unmarking it
-- deletes that entry again.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  number text not null,
  customer_name text not null,
  customer_email text,

  issue_date date not null,
  due_date date not null,

  -- Only these four. "Overdue" is derived from due_date at read time, so it
  -- can't go stale overnight the way a stored flag would.
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),

  -- Line items. Kept as JSON rather than a child table: they're only ever read
  -- and written with their parent invoice, never queried across invoices, and
  -- this keeps the whole invoice a single atomic row.
  lines jsonb not null default '[]'::jsonb,

  notes text,
  paid_date date,

  -- The books entry created when this was marked paid, if any.
  entry_id uuid references public.entries (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One number per account. Two invoices sharing a number is a real accounting
-- problem; gaps in the sequence are normal and fine.
create unique index if not exists invoices_user_number_idx
  on public.invoices (user_id, number);

create index if not exists invoices_user_status_idx
  on public.invoices (user_id, status, due_date);

alter table public.invoices enable row level security;

drop policy if exists "Read own invoices" on public.invoices;
create policy "Read own invoices" on public.invoices
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Add own invoices" on public.invoices;
create policy "Add own invoices" on public.invoices
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Update own invoices" on public.invoices;
create policy "Update own invoices" on public.invoices
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Delete own invoices" on public.invoices;
create policy "Delete own invoices" on public.invoices
  for delete to authenticated using (auth.uid() = user_id);

-- Keep updated_at honest.
create or replace function public.touch_invoice_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invoices_touch_updated_at on public.invoices;
create trigger invoices_touch_updated_at
  before update on public.invoices
  for each row execute function public.touch_invoice_updated_at();


-- ---------------------------------------------------------------------------
-- Daily reminder settings
-- ---------------------------------------------------------------------------
-- Stored on the account rather than the device so the chosen time follows you
-- between phone and laptop. Delivery is still per-device (see the note in
-- reminders.ts) because this app has no push server.

alter table public.user_settings
  add column if not exists reminder_enabled boolean not null default false;

alter table public.user_settings
  add column if not exists reminder_time text;

alter table public.user_settings
  add column if not exists reminder_last_shown date;
