import type { SupabaseClient } from "@supabase/supabase-js";

import { chatWithAI, extractReceiptData, type ReceiptExtraction } from "./ai.server";
import { answerFromEntries } from "./bookkeeping-answers";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type Entry = {
  id: string;
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant: string | null;
  payment_method: string | null;
  receipt_path: string | null;
  household_id: string | null;
  user_id: string;
  created_at: string;
};

const ENTRY_COLUMNS =
  "id, entry_date, amount_in, amount_out, spent_on, merchant, payment_method, receipt_path, household_id, user_id, created_at";

/**
 * Your own entries, plus anything shared with a household you belong to.
 * Row level security enforces the same rule server-side.
 */
export async function fetchEntries(supabase: Client, userId: string): Promise<Entry[]> {
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();

  let query = supabase.from("entries").select(ENTRY_COLUMNS);

  query = membership?.household_id
    ? query.or(`user_id.eq.${userId},household_id.eq.${membership.household_id}`)
    : query.eq("user_id", userId);

  const { data, error } = await query
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    ...row,
    amount_in: Number(row.amount_in),
    amount_out: Number(row.amount_out),
  }));
}

export async function insertEntry(
  supabase: Client,
  userId: string,
  input: {
    entry_date: string;
    amount_in: number;
    amount_out: number;
    spent_on: string | null;
    merchant?: string | null;
    payment_method?: string | null;
    /** When true, share this entry with the household the user belongs to. */
    shared?: boolean;
  },
): Promise<Entry> {
  const { shared, ...fields } = input;

  let householdId: string | null = null;
  if (shared) {
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", userId)
      .maybeSingle();
    householdId = membership?.household_id ?? null;
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({ ...fields, user_id: userId, household_id: householdId })
    .select("id, entry_date, amount_in, amount_out, spent_on, merchant, payment_method, receipt_path, household_id, user_id, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, amount_in: Number(data.amount_in), amount_out: Number(data.amount_out) };
}

function summarize(entries: Entry[]) {
  const totalIn = entries.reduce((sum, e) => sum + e.amount_in, 0);
  const totalOut = entries.reduce((sum, e) => sum + e.amount_out, 0);
  const byCategory = new Map<string, number>();
  for (const e of entries) {
    if (e.amount_out <= 0) continue;
    const key = (e.spent_on ?? "Uncategorized").trim() || "Uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + e.amount_out);
  }

  const lines = entries
    .slice(0, 120)
    .map(
      (e) =>
        `${e.entry_date}: in ${e.amount_in.toFixed(2)}, out ${e.amount_out.toFixed(2)}${
          e.spent_on ? ` (${e.spent_on})` : ""
        }`,
    )
    .join("\n");

  const categoryLines = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => `${name}: ${amount.toFixed(2)}`)
    .join("\n");

  return `Totals across all entries: money in ${totalIn.toFixed(2)}, money out ${totalOut.toFixed(
    2,
  )}, net ${(totalIn - totalOut).toFixed(2)}.

Spending by category:
${categoryLines || "(no spending logged yet)"}

Recent entries (newest first):
${lines || "(no entries logged yet)"}`;
}

export async function answerQuestion(
  supabase: Client,
  userId: string,
  question: string,
): Promise<string> {
  const entries = await fetchEntries(supabase, userId);

  // Budgets and recurring bills let the local answers cover budget status and
  // upcoming bills too. If either lookup fails, carry on without it.
  const { fetchBudgets, fetchRecurring, fetchGoals } = await import("./planning.server");
  const { fetchProducts, fetchSettings } = await import("./shop.server");
  const [budgets, recurring, goals, products, settings] = await Promise.all([
    fetchBudgets(supabase, userId).catch(() => []),
    fetchRecurring(supabase, userId).catch(() => []),
    fetchGoals(supabase, userId).catch(() => []),
    fetchProducts(supabase, userId).catch(() => []),
    fetchSettings(supabase, userId).catch(() => ({ tax_rate_percent: 0, opening_float: 0 })),
  ]);

  // Answer from the owner's own data. This always works — no API key, no cost,
  // no outage — and it can't invent numbers about the business.
  const localAnswer = answerFromEntries(entries, question, {
    budgets,
    recurring,
    goals,
    products,
    taxRatePercent: settings.tax_rate_percent,
  });

  // If an AI provider is configured and working, use it for a richer answer
  // (including general money questions). Otherwise fall back to the local one.
  const hasAiKey = Boolean(
    (await import("./server-env")).readServerEnv("GEMINI_API_KEY") ??
      (await import("./server-env")).readServerEnv("ANTHROPIC_API_KEY"),
  );
  if (!hasAiKey) return localAnswer;

  try {
    const text = await chatWithAI(
    `You are a warm, down-to-earth money helper for a small shop owner. Today's date is ${new Date()
      .toISOString()
      .slice(0, 10)}.

You can help with two kinds of questions:
1. Questions about THEIR OWN numbers ("what did I spend the most on?", "can I afford more supplies?"). Answer these using the bookkeeping data provided below. Use the real numbers. If the data doesn't cover it, say so plainly rather than guessing.
2. General small-business money questions ("what's a good profit margin?", "how should I price my products?", "what business expenses are tax deductible?", "should I save for slow months?"). Answer these from general knowledge, and tie the advice back to their actual numbers when it's relevant and you have the data.

Style rules:
- Plain everyday language. Never accounting jargon; if you must use a term, explain it in a few words.
- Keep answers to 2-5 short sentences. Be concrete and practical.
- Never invent numbers about their business. Only cite figures that appear in the data below.
- For tax, legal, or investment questions, give the general picture and remind them briefly to confirm with a qualified accountant or advisor for their situation — you are not one.`,
      `Here is the shop's bookkeeping data:\n\n${summarize(entries)}\n\nOwner's question: ${question}`,
    );
    return text;
  } catch {
    // AI provider is down, out of credit, or misconfigured — the owner still
    // gets a useful answer about their own numbers.
    return localAnswer;
  }
}

export async function deleteEntry(
  supabase: Client,
  userId: string,
  entryId: string,
): Promise<{ id: string }> {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return { id: entryId };
}

export async function analyzeReceiptPhoto(
  base64Image: string,
  mimeType: string,
): Promise<ReceiptExtraction> {
  return extractReceiptData(base64Image, mimeType);
}

export async function setEntryReceipt(
  supabase: Client,
  userId: string,
  entryId: string,
  receiptPath: string | null,
): Promise<Entry> {
  const { data, error } = await supabase
    .from("entries")
    .update({ receipt_path: receiptPath })
    .eq("id", entryId)
    .eq("user_id", userId)
    .select("id, entry_date, amount_in, amount_out, spent_on, merchant, payment_method, receipt_path, household_id, user_id, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, amount_in: Number(data.amount_in), amount_out: Number(data.amount_out) };
}
