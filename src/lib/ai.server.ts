// Server-only AI helpers. Supports Google Gemini (free tier) and Anthropic
// Claude, picking whichever API key is configured.
//
// Gemini (free, no card required): create a key at https://aistudio.google.com/apikey
// and set it as a GEMINI_API_KEY build variable.
// Anthropic (paid, prepaid credits): https://console.anthropic.com/settings/keys
// set as ANTHROPIC_API_KEY.
//
// If both are set, Gemini is used first and Claude is the fallback.

import { readServerEnv } from "./server-env";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_DEFAULT_MODEL = "gemini-2.0-flash";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export type AiPart =
  | { kind: "text"; text: string }
  | { kind: "image"; base64: string; mimeType: string };

type AiRequest = {
  system: string;
  parts: AiPart[];
  maxTokens?: number;
};

// --- Gemini ---------------------------------------------------------------

async function callGemini(apiKey: string, req: AiRequest): Promise<string> {
  const model = readServerEnv("GEMINI_MODEL") ?? GEMINI_DEFAULT_MODEL;

  const parts = req.parts.map((part) =>
    part.kind === "text"
      ? { text: part.text }
      : { inline_data: { mime_type: part.mimeType, data: part.base64 } },
  );

  const response = await fetch(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { maxOutputTokens: req.maxTokens ?? 700, temperature: 0.4 },
      }),
    },
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Gemini API error (${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}

// --- Anthropic ------------------------------------------------------------

async function callAnthropic(apiKey: string, req: AiRequest): Promise<string> {
  const model = readServerEnv("ANTHROPIC_MODEL") ?? ANTHROPIC_DEFAULT_MODEL;

  const content = req.parts.map((part) =>
    part.kind === "text"
      ? { type: "text" as const, text: part.text }
      : {
          type: "image" as const,
          source: { type: "base64" as const, media_type: part.mimeType, data: part.base64 },
        },
  );

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 700,
      system: req.system,
      messages: [{ role: "user", content }],
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
  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}

// --- Provider selection ---------------------------------------------------

async function callAi(req: AiRequest): Promise<string> {
  const geminiKey = readServerEnv("GEMINI_API_KEY");
  const anthropicKey = readServerEnv("ANTHROPIC_API_KEY");

  if (!geminiKey && !anthropicKey) {
    throw new Error(
      "AI is not set up yet — add a GEMINI_API_KEY (free) or ANTHROPIC_API_KEY environment variable.",
    );
  }

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, req);
    } catch (error) {
      // Fall back to Claude if it's configured; otherwise surface the error.
      if (!anthropicKey) throw error;
    }
  }

  return callAnthropic(anthropicKey!, req);
}

/** Plain-language Q&A over the shop's bookkeeping data, plus general money questions. */
export async function chatWithAI(system: string, prompt: string): Promise<string> {
  const text = await callAi({
    system,
    maxTokens: 700,
    parts: [{ kind: "text", text: prompt }],
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
  const text = await callAi({
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
    parts: [
      { kind: "image", base64: base64Image, mimeType },
      { kind: "text", text: "Extract the details from this receipt." },
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
      category:
        typeof parsed.category === "string" && parsed.category.trim()
          ? parsed.category.trim()
          : null,
      entry_date:
        typeof parsed.entry_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.entry_date)
          ? parsed.entry_date
          : null,
      merchant:
        typeof parsed.merchant === "string" && parsed.merchant.trim()
          ? parsed.merchant.trim()
          : null,
    };
  } catch {
    return { amount: null, category: null, entry_date: null, merchant: null };
  }
}
