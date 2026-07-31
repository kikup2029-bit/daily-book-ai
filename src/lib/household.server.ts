import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type Household = {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
};

export type HouseholdMember = {
  user_id: string;
  display_name: string | null;
  role: string;
};

export type HouseholdState = {
  household: Household | null;
  members: HouseholdMember[];
  isOwner: boolean;
};

/** Short, unambiguous join code (no 0/O/1/I to avoid confusion when read aloud). */
function makeJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function fetchHousehold(supabase: Client, userId: string): Promise<HouseholdState> {
  const { data: membership, error: memberError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (memberError) throw new Error(memberError.message);
  if (!membership) return { household: null, members: [], isOwner: false };

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("id, name, owner_id, join_code")
    .eq("id", membership.household_id)
    .maybeSingle();
  if (householdError) throw new Error(householdError.message);
  if (!household) return { household: null, members: [], isOwner: false };

  const { data: members, error: membersError } = await supabase
    .from("household_members")
    .select("user_id, display_name, role")
    .eq("household_id", household.id)
    .order("joined_at", { ascending: true });
  if (membersError) throw new Error(membersError.message);

  return {
    household,
    members: members ?? [],
    isOwner: household.owner_id === userId,
  };
}

export async function createHousehold(
  supabase: Client,
  userId: string,
  input: { name: string; display_name: string | null },
): Promise<HouseholdState> {
  const existing = await fetchHousehold(supabase, userId);
  if (existing.household) {
    throw new Error("You're already in a household. Leave it first to start a new one.");
  }

  // Retry on the tiny chance of a duplicate code.
  let household: Household | null = null;
  let lastError: string | null = null;
  for (let attempt = 0; attempt < 5 && !household; attempt += 1) {
    const { data, error } = await supabase
      .from("households")
      .insert({ name: input.name, owner_id: userId, join_code: makeJoinCode() })
      .select("id, name, owner_id, join_code")
      .single();
    if (error) {
      lastError = error.message;
      continue;
    }
    household = data;
  }
  if (!household) throw new Error(lastError ?? "Could not create the household.");

  const { error: memberError } = await supabase.from("household_members").insert({
    household_id: household.id,
    user_id: userId,
    display_name: input.display_name,
    role: "owner",
  });
  if (memberError) throw new Error(memberError.message);

  return fetchHousehold(supabase, userId);
}

export async function joinHousehold(
  supabase: Client,
  userId: string,
  input: { join_code: string; display_name: string | null },
): Promise<HouseholdState> {
  const existing = await fetchHousehold(supabase, userId);
  if (existing.household) {
    throw new Error("You're already in a household. Leave it first to join another.");
  }

  const code = input.join_code.trim().toUpperCase();
  if (!code) throw new Error("Enter the code you were given.");

  // Handled by a database function: row level security hides households you're
  // not in, so the lookup and the join happen atomically inside Postgres. No
  // service-role key required.
  const { error } = await supabase.rpc("join_household_by_code", {
    code,
    display_name: input.display_name,
  });

  if (error) {
    const message = error.message ?? "";
    if (/already in a household/i.test(message)) {
      throw new Error("You're already in a household. Leave it first to join another.");
    }
    if (/No household matches/i.test(message)) {
      throw new Error("That code doesn't match any household. Check it and try again.");
    }
    throw new Error(message || "Could not join that household.");
  }

  return fetchHousehold(supabase, userId);
}

export async function leaveHousehold(supabase: Client, userId: string) {
  const state = await fetchHousehold(supabase, userId);
  if (!state.household) return { ok: true };

  // Un-share anything this person shared, so it goes back to being private
  // to them rather than being orphaned in a household they've left.
  const { error: unshareError } = await supabase
    .from("entries")
    .update({ household_id: null })
    .eq("user_id", userId)
    .eq("household_id", state.household.id);
  if (unshareError) throw new Error(unshareError.message);

  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("household_id", state.household.id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  return { ok: true };
}

export async function renameMember(
  supabase: Client,
  userId: string,
  displayName: string | null,
) {
  const state = await fetchHousehold(supabase, userId);
  if (!state.household) throw new Error("You're not in a household.");

  const { error } = await supabase
    .from("household_members")
    .update({ display_name: displayName })
    .eq("household_id", state.household.id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Shared spending plus who owes whom. */
export async function fetchSettlement(supabase: Client, userId: string) {
  const state = await fetchHousehold(supabase, userId);
  if (!state.household) {
    return { household: null, settlement: null };
  }

  const { data, error } = await supabase
    .from("entries")
    .select("user_id, amount_out")
    .eq("household_id", state.household.id);
  if (error) throw new Error(error.message);

  const { settleShared } = await import("./settlement");
  const settlement = settleShared(
    (data ?? []).map((row) => ({ user_id: row.user_id, amount_out: Number(row.amount_out) })),
    state.members.map((m) => ({ user_id: m.user_id, display_name: m.display_name })),
  );

  return { household: state.household, settlement };
}
