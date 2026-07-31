// Server-only helpers for calling the Anthropic (Claude) API directly.
// Requires an ANTHROPIC_API_KEY environment variable — get one from
// https://console.anthropic.com/settings/keys and add it as an encrypted
// secret in Cloudflare (Settings -> Variables and Secrets). Never commit it
// or share it in chat.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "AI is not configured yet — add an ANTHROPIC_API_KEY environment variable to enable it.",
    );
  }
  return key;
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

async function callClaude(params: {
  system: string;
  content: ContentBlock[];
  maxTokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 512,
      system: params.system,
      messages: [{ role: "user", content: params.content }],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Claude API error (${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content?.find((block) => block.type === "text")?.text;
  if (!text) throw new Error("Claude returned an empty response.");
  return text;
}

/** Plain-language Q&A over the shop's bookkeeping data. */
export async function chatWithClaude(system: string, prompt: string): Promise<string> {
  const text = await callClaude({
    system,
    content: [{ type: "text", text: prompt }],
  });
  return text.trim();
}

export type ReceiptExtraction = {
  amount: number | null;
  category: string | null;
  entry_date: string | null;
  merchant: string | null;
};

/** Reads a receipt photo and pulls out the total, a likely category, date, and merchant name. */
export async function extractReceiptData(
  base64Image: string,
  mimeType: string,
): Promise<ReceiptExtraction> {
  const today = new Date().toISOString().slice(0, 10);
  const text = await callClaude({
    maxTokens: 400,
    system: `You read photos of paper/digital receipts for a small shop's bookkeeping app.
Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{"amount": number|null, "category": string|null, "entry_date": "YYYY-MM-DD"|null, "merchant": string|null}

Rules:
- "amount" is the final total paid on the receipt (a positive number), or null if you can't find one.
- "category" is a short, simple shopping category a small business owner would recognize, e.g. "Supplies", "Inventory", "Rent", "Utilities", "Food", "Equipment", "Fuel", "Marketing". Pick the single best fit, or null if unclear.
- "entry_date" is the purchase date on the receipt in YYYY-MM-DD format if visible, otherwise null. Today is ${today} — never guess a future date.
- "merchant" is the store/business name on the receipt if visible, otherwise null.
- If the image is not a receipt at all, return all fields as null.`,
    content: [
      {
        type: "image",
        source: { type: "base64", media_type: mimeType, data: base64Image },
      },
      { type: "text", text: "Extract the details from this receipt." },
    ],
  });

  try {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<ReceiptExtraction>;
    return {
      amount: typeof parsed.amount === "number" && parsed.amount > 0 ? parsed.amount : null,
      category: typeof parsed.category === "string" && parsed.category.trim() ? parsed.category.trim() : null,
      entry_date:
        typeof parsed.entry_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.entry_date)
          ? parsed.entry_date
          : null,
      merchant: typeof parsed.merchant === "string" && parsed.merchant.trim() ? parsed.merchant.trim() : null,
    };
  } catch {
    return { amount: null, category: null, entry_date: null, merchant: null };
  }
}
