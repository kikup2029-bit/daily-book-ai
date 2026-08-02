-- SimpleBooks AI — household sharing.
--
-- Model: an entry stays private to whoever logged it unless it's given a
-- household_id, in which case every member of that household can see it.
-- Nothing existing changes: household_id starts null on every current row.
--
-- Paste this whole file into the Supabase SQL Editor and click Run once.

-- 1. Households -----------------------------------------------------------
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null,
  display_name text,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists household_members_user_idx on public.household_members (user_id);

-- 2. Link entries to a household (null = private) --------------------------
alter table public.entries add column if not exists household_id uuid;
create index if not exists entries_household_idx on public.entries (household_id);

-- 3. Membership helper ----------------------------------------------------
-- SECURITY DEFINER so the policies below can check membership without
-- re-triggering row level security on household_members (which would recurse).
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = auth.uid()
  );
$$;

-- Returns the caller's household, or null. Also SECURITY DEFINER.
create or replace function public.my_household_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select m.household_id from public.household_members m
  where m.user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.is_household_member(uuid) to authenticated;
grant execute on function public.my_household_id() to authenticated;

-- Join by code, done entirely inside the database.
--
-- Row level security hides households you're not a member of, so a normal
-- SELECT can't find one by its code. This function looks it up and adds the
-- caller as a member in one atomic step. It only ever exposes the household
-- the code matches — it can't be used to browse other households.
create or replace function public.join_household_by_code(code text, display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
  already uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select m.household_id into already
  from public.household_members m
  where m.user_id = auth.uid()
  limit 1;

  if already is not null then
    raise exception 'You are already in a household';
  end if;

  select h.id into target
  from public.households h
  where upper(h.join_code) = upper(trim(code))
  limit 1;

  if target is null then
    raise exception 'No household matches that code';
  end if;

  insert into public.household_members (household_id, user_id, display_name, role)
  values (target, auth.uid(), display_name, 'member');

  return target;
end;
$$;

grant execute on function public.join_household_by_code(text, text) to authenticated;

-- Create a household and make the caller its owner, in one atomic step.
-- Done as a function so the household row and the membership row can't get
-- out of sync, and so creation doesn't depend on insert-policy subtleties.
create or replace function public.create_household(name text, display_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  already uuid;
  new_id uuid;
  code text;
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  attempt int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;

  select m.household_id into already from public.household_members m
  where m.user_id = auth.uid() limit 1;

  if already is not null then
    raise exception 'You are already in a household';
  end if;

  if coalesce(trim(name), '') = '' then
    raise exception 'Give the household a name';
  end if;

  loop
    attempt := attempt + 1;
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    end loop;

    begin
      insert into public.households (name, owner_id, join_code)
      values (trim(name), auth.uid(), code)
      returning id into new_id;
      exit;
    exception when unique_violation then
      if attempt >= 10 then
        raise exception 'Could not generate a unique code';
      end if;
    end;
  end loop;

  insert into public.household_members (household_id, user_id, display_name, role)
  values (new_id, auth.uid(), display_name, 'owner');

  return new_id;
end;
$$;

grant execute on function public.create_household(text, text) to authenticated;

-- 4. Policies: households -------------------------------------------------
grant select, insert, update, delete on public.households to authenticated;
grant all on public.households to service_role;
alter table public.households enable row level security;

drop policy if exists "Members can read their household" on public.households;
drop policy if exists "Anyone can create a household" on public.households;
drop policy if exists "Owner can update their household" on public.households;
drop policy if exists "Owner can delete their household" on public.households;

create policy "Members can read their household" on public.households
  for select to authenticated using (public.is_household_member(id));
create policy "Anyone can create a household" on public.households
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owner can update their household" on public.households
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owner can delete their household" on public.households
  for delete to authenticated using (auth.uid() = owner_id);

-- 5. Policies: members ----------------------------------------------------
grant select, insert, update, delete on public.household_members to authenticated;
grant all on public.household_members to service_role;
alter table public.household_members enable row level security;

drop policy if exists "Members can see each other" on public.household_members;
drop policy if exists "You can add yourself" on public.household_members;
drop policy if exists "You can update your own membership" on public.household_members;
drop policy if exists "You can remove yourself" on public.household_members;

create policy "Members can see each other" on public.household_members
  for select to authenticated using (public.is_household_member(household_id));
-- Joining is done by inserting your own row (the app checks the join code first).
create policy "You can add yourself" on public.household_members
  for insert to authenticated with check (auth.uid() = user_id);
create policy "You can update your own membership" on public.household_members
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "You can remove yourself" on public.household_members
  for delete to authenticated using (auth.uid() = user_id);

-- 6. Entries: allow members to read/write shared rows ---------------------
drop policy if exists "Users can read their own entries" on public.entries;
drop policy if exists "Users can add their own entries" on public.entries;
drop policy if exists "Users can update their own entries" on public.entries;
drop policy if exists "Users can delete their own entries" on public.entries;

-- Read: your own rows, plus anything shared with a household you belong to.
create policy "Read own or shared entries" on public.entries
  for select to authenticated
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  );

-- Insert: must be your own row. It may be shared, but only with a household
-- you actually belong to.
create policy "Add own entries" on public.entries
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and (household_id is null or public.is_household_member(household_id))
  );

-- Update: your own rows, or shared rows in your household (so a partner can
-- fix a typo). Can't move a row into a household you're not in.
create policy "Update own or shared entries" on public.entries
  for update to authenticated
  using (
    auth.uid() = user_id
    or (household_id is not null and public.is_household_member(household_id))
  )
  with check (
    household_id is null or public.is_household_member(household_id)
  );

-- Delete: only whoever logged it, to avoid nasty surprises.
create policy "Delete own entries" on public.entries
  for delete to authenticated using (auth.uid() = user_id);
