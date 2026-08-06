import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

// --- products -------------------------------------------------------------

export type Product = {
  id: string;
  name: string;
  unit_cost: number;
  sale_price: number;
};

const PRODUCT_COLUMNS = "id, name, unit_cost, sale_price";

function toProduct(row: {
  id: string;
  name: string;
  unit_cost: number | string;
  sale_price: number | string;
}): Product {
  return {
    id: row.id,
    name: row.name,
    unit_cost: Number(row.unit_cost),
    sale_price: Number(row.sale_price),
  };
}

export async function fetchProducts(supabase: Client, userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toProduct);
}

export async function upsertProduct(
  supabase: Client,
  userId: string,
  input: { id?: string | null; name: string; unit_cost: number; sale_price: number },
): Promise<Product> {
  const payload = {
    name: input.name,
    unit_cost: input.unit_cost,
    sale_price: input.sale_price,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", userId)
      .select(PRODUCT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return toProduct(data);
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...payload, user_id: userId })
    .select(PRODUCT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toProduct(data);
}

export async function deleteProduct(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// --- settings -------------------------------------------------------------

export type Settings = {
  tax_rate_percent: number;
  opening_float: number;
  /** Whether an app lock PIN is set. The hash itself never leaves the server. */
  lock_enabled: boolean;
  lock_timeout_minutes: number;
  /** Daily nudge to log the day's takings. */
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_last_shown: string | null;
};

export async function fetchSettings(supabase: Client, userId: string): Promise<Settings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("tax_rate_percent, opening_float, lock_pin_hash, lock_timeout_minutes")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  // The reminder columns arrived after the lock ones. Reading them separately
  // means the whole settings screen doesn't fail for anyone who hasn't run the
  // newer migration yet — they just see reminders switched off.
  const reminder = await fetchReminderColumns(supabase, userId);

  return {
    tax_rate_percent: Number(data?.tax_rate_percent ?? 0),
    opening_float: Number(data?.opening_float ?? 0),
    lock_enabled: Boolean(data?.lock_pin_hash),
    lock_timeout_minutes: Number(data?.lock_timeout_minutes ?? 5),
    ...reminder,
  };
}

async function fetchReminderColumns(supabase: Client, userId: string) {
  const fallback = {
    reminder_enabled: false,
    reminder_time: null as string | null,
    reminder_last_shown: null as string | null,
  };
  try {
    const { data, error } = await supabase
      .from("user_settings")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select("reminder_enabled, reminder_time, reminder_last_shown" as any)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return fallback;
    const row = data as unknown as {
      reminder_enabled?: boolean;
      reminder_time?: string | null;
      reminder_last_shown?: string | null;
    } | null;
    return {
      reminder_enabled: Boolean(row?.reminder_enabled),
      reminder_time: row?.reminder_time ?? null,
      reminder_last_shown: row?.reminder_last_shown ?? null,
    };
  } catch {
    return fallback;
  }
}

/** Saves the reminder preference. Separate from the tax settings on purpose. */
export async function saveReminder(
  supabase: Client,
  userId: string,
  input: { enabled: boolean; time: string | null; last_shown?: string | null },
) {
  const patch: Record<string, unknown> = {
    user_id: userId,
    reminder_enabled: input.enabled,
    reminder_time: input.time,
  };
  if (input.last_shown !== undefined) patch.reminder_last_shown = input.last_shown;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("user_settings").upsert(patch as any, {
    onConflict: "user_id",
  });
  if (error) {
    if (/reminder_/.test(error.message)) {
      throw new Error(
        "Reminders aren't set up on your database yet. Run supabase/add-invoices.sql in the Supabase SQL Editor, then reload.",
      );
    }
    throw new Error(error.message);
  }
  return { ok: true };
}

// --- app lock -------------------------------------------------------------

/** Stores a new PIN. The plain PIN is hashed here and never persisted. */
export async function setLockPin(
  supabase: Client,
  userId: string,
  input: { pin: string; timeout_minutes: number },
) {
  const { validatePin, randomSalt, hashPin } = await import("./pin");
  const problem = validatePin(input.pin);
  if (problem) throw new Error(problem);

  const salt = randomSalt();
  const hash = await hashPin(input.pin, salt);

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      lock_pin_hash: hash,
      lock_pin_salt: salt,
      lock_timeout_minutes: input.timeout_minutes,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function clearLockPin(supabase: Client, userId: string) {
  const { error } = await supabase
    .from("user_settings")
    .update({ lock_pin_hash: null, lock_pin_salt: null })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/**
 * Checks a PIN. Comparison happens server-side so the hash is never sent to
 * the browser, and a wrong PIN reveals nothing beyond "no".
 */
export async function checkLockPin(
  supabase: Client,
  userId: string,
  pin: string,
): Promise<{ ok: boolean }> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("lock_pin_hash, lock_pin_salt")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  // No PIN set means nothing to unlock.
  if (!data?.lock_pin_hash || !data?.lock_pin_salt) return { ok: true };

  const { verifyPin } = await import("./pin");
  return { ok: await verifyPin(pin, data.lock_pin_salt, data.lock_pin_hash) };
}

export async function saveSettings(
  supabase: Client,
  userId: string,
  input: { tax_rate_percent: number; opening_float: number },
): Promise<Settings> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      tax_rate_percent: input.tax_rate_percent,
      opening_float: input.opening_float,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  return fetchSettings(supabase, userId);
}

// --- cash drawer counts ---------------------------------------------------

export type CashCount = {
  id: string;
  count_date: string;
  counted_amount: number;
  opening_float: number;
  expected_amount: number;
  difference: number;
  note: string | null;
};

const COUNT_COLUMNS =
  "id, count_date, counted_amount, opening_float, expected_amount, difference, note";

function toCount(row: {
  id: string;
  count_date: string;
  counted_amount: number | string;
  opening_float: number | string;
  expected_amount: number | string;
  difference: number | string;
  note: string | null;
}): CashCount {
  return {
    id: row.id,
    count_date: row.count_date,
    counted_amount: Number(row.counted_amount),
    opening_float: Number(row.opening_float),
    expected_amount: Number(row.expected_amount),
    difference: Number(row.difference),
    note: row.note,
  };
}

export async function fetchCashCounts(supabase: Client, userId: string): Promise<CashCount[]> {
  const { data, error } = await supabase
    .from("cash_counts")
    .select(COUNT_COLUMNS)
    .eq("user_id", userId)
    .order("count_date", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toCount);
}

/**
 * Records an end-of-day drawer count. The expected figure is worked out
 * server-side from the entries themselves, so it can't be fudged from the
 * client.
 */
export async function recordCashCount(
  supabase: Client,
  userId: string,
  input: { count_date: string; counted_amount: number; opening_float: number; note: string | null },
): Promise<CashCount> {
  const { fetchEntries } = await import("./books.server");
  const { reconcileDrawer } = await import("./insights");

  const entries = await fetchEntries(supabase, userId);
  const check = reconcileDrawer(entries, {
    date: input.count_date,
    counted: input.counted_amount,
    openingFloat: input.opening_float,
  });

  const { data, error } = await supabase
    .from("cash_counts")
    .upsert(
      {
        user_id: userId,
        count_date: input.count_date,
        counted_amount: input.counted_amount,
        opening_float: input.opening_float,
        expected_amount: check.expected,
        difference: check.difference,
        note: input.note,
      },
      { onConflict: "user_id,count_date" },
    )
    .select(COUNT_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toCount(data);
}

export async function deleteCashCount(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("cash_counts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
