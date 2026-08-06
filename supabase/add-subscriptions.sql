-- Subscriptions.
--
-- Run once in the Supabase SQL Editor. Safe to run twice.
--
-- The important rule this schema enforces: a row here is written ONLY by the
-- Stripe webhook, using the service role. Nothing the browser sends can grant
-- itself Pro, because the browser has no write access at all — read only, and
-- only to its own row.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,

  stripe_customer_id text unique,
  stripe_subscription_id text unique,

  -- "free" until a webhook says otherwise.
  plan text not null default 'free' check (plan in ('free', 'pro')),

  -- Stripe's own status string, stored verbatim. Mapping it to "does this
  -- person get Pro" happens in code, so a new Stripe status can be handled
  -- without a migration.
  status text,

  -- When the current paid period ends. Also what a cancelled-but-not-yet-
  -- expired subscription counts down to.
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Read your own row, so the app can show your plan and renewal date.
drop policy if exists "Read own subscription" on public.subscriptions;
create policy "Read own subscription" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- Deliberately NO insert, update or delete policy for authenticated users.
-- Writes happen only through the service role key, which lives on the server
-- and bypasses RLS. If a browser could write here, Pro would be free for
-- anyone who can open devtools.


-- ---------------------------------------------------------------------------
-- Webhook events already processed
-- ---------------------------------------------------------------------------
-- Stripe retries a webhook until it gets a 2xx, and can deliver the same event
-- more than once even after success. Recording the id makes replays harmless:
-- the second delivery sees the row, does nothing, and returns 200.

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- No policies at all: this table is service-role only. Nobody's browser has
-- any business reading Stripe's event log.


create or replace function public.touch_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_subscription_updated_at();
