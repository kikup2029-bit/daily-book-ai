import { generateText } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export type Entry = {
  id: string;
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  receipt_path: string | null;
  created_at: string;
};

export async function fetchEntries(supabase: Client, userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from("entries")
    .select("id, entry_date, amount_in, amount_out, spent_on, receipt_path, created_at")
    .eq("user_id", userId)
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
  },
): Promise<Entry> {
  const { data, error } = await supabase
    .from("entries")
    .insert({ ...input, user_id: userId })
    .select("id, entry_date, amount_in, amount_out, spent_on, receipt_path, created_at")
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
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured yet.");

  const entries = await fetchEntries(supabase, userId);
  const gateway = createLovableAiGatewayProvider(apiKey);

  const { text } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    system: `You are a warm, down-to-earth bookkeeping helper for a small shop owner.
Answer using ONLY the bookkeeping data provided. Use plain everyday language, never accounting jargon.
Keep answers to 2-4 short sentences. Use the numbers you were given, and say so plainly if the data is not enough to answer.
Today's date is ${new Date().toISOString().slice(0, 10)}.`,
    prompt: `Here is the shop's bookkeeping data:\n\n${summarize(entries)}\n\nOwner's question: ${question}`,
  });

  return text.trim();
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
    .select("id, entry_date, amount_in, amount_out, spent_on, receipt_path, created_at")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, amount_in: Number(data.amount_in), amount_out: Number(data.amount_out) };
}
