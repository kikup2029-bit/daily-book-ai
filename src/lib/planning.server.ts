import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type Recurring = {
  id: string;
  amount: number;
  category: string;
  frequency: "weekly" | "monthly";
  start_date: string;
  active: boolean;
  last_generated_date: string | null;
};

export type Budget = {
  id: string;
  category: string;
  monthly_limit: number;
};

const RECURRING_COLUMNS =
  "id, amount, category, frequency, start_date, active, last_generated_date";

function toRecurring(row: {
  id: string;
  amount: number | string;
  category: string;
  frequency: string;
  start_date: string;
  active: boolean;
  last_generated_date: string | null;
}): Recurring {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    frequency: row.frequency === "weekly" ? "weekly" : "monthly",
    start_date: row.start_date,
    active: row.active,
    last_generated_date: row.last_generated_date,
  };
}

export async function fetchRecurring(supabase: Client, userId: string): Promise<Recurring[]> {
  const { data, error } = await supabase
    .from("recurring_expenses")
    .select(RECURRING_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRecurring);
}

export async function upsertRecurring(
  supabase: Client,
  userId: string,
  input: {
    id?: string | null;
    amount: number;
    category: string;
    frequency: "weekly" | "monthly";
    start_date: string;
    active: boolean;
  },
): Promise<Recurring> {
  const payload = {
    amount: input.amount,
    category: input.category,
    frequency: input.frequency,
    start_date: input.start_date,
    active: input.active,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("recurring_expenses")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", userId)
      .select(RECURRING_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toRecurring(data);
  }

  const { data, error } = await supabase
    .from("recurring_expenses")
    .insert({ ...payload, user_id: userId })
    .select(RECURRING_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toRecurring(data);
}

export async function deleteRecurring(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

/**
 * Creates any expense entries that a recurring rule owes up to today.
 * Idempotent: `last_generated_date` tracks the newest generated occurrence.
 */
export async function generateRecurringEntries(supabase: Client, userId: string) {
  const rules = await fetchRecurring(supabase, userId);
  const today = new Date().toISOString().slice(0, 10);
  let created = 0;

  for (const rule of rules) {
    if (!rule.active || rule.amount <= 0) continue;

    let next = rule.last_generated_date
      ? rule.frequency === "weekly"
        ? addDays(rule.last_generated_date, 7)
        : addMonths(rule.last_generated_date, 1)
      : rule.start_date;

    const rows: {
      user_id: string;
      entry_date: string;
      amount_in: number;
      amount_out: number;
      spent_on: string;
    }[] = [];

    let guard = 0;
    while (next <= today && guard < 400) {
      rows.push({
        user_id: userId,
        entry_date: next,
        amount_in: 0,
        amount_out: rule.amount,
        spent_on: rule.category,
      });
      next = rule.frequency === "weekly" ? addDays(next, 7) : addMonths(next, 1);
      guard += 1;
    }

    if (rows.length === 0) continue;

    const { error } = await supabase.from("entries").insert(rows);
    if (error) throw new Error(error.message);

    const { error: updateError } = await supabase
      .from("recurring_expenses")
      .update({ last_generated_date: rows[rows.length - 1].entry_date })
      .eq("id", rule.id)
      .eq("user_id", userId);
    if (updateError) throw new Error(updateError.message);

    created += rows.length;
  }

  return { created };
}

export async function fetchBudgets(supabase: Client, userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("category_budgets")
    .select("id, category, monthly_limit")
    .eq("user_id", userId)
    .order("category", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    monthly_limit: Number(row.monthly_limit),
  }));
}

export async function upsertBudget(
  supabase: Client,
  userId: string,
  input: { category: string; monthly_limit: number },
): Promise<Budget> {
  const { data, error } = await supabase
    .from("category_budgets")
    .upsert(
      { user_id: userId, category: input.category, monthly_limit: input.monthly_limit },
      { onConflict: "user_id,category" },
    )
    .select("id, category, monthly_limit")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, category: data.category, monthly_limit: Number(data.monthly_limit) };
}

export async function deleteBudget(supabase: Client, userId: string, id: string) {
  const { error } = await supabase
    .from("category_budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
