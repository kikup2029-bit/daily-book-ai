// Server-only AI helpers. Supports several providers and uses whichever one
// has a key configured, trying the free ones first.
//
// FREE OPTIONS (no card required):
//  1. Groq — https://console.groq.com/keys  → GROQ_API_KEY
//  2. Google Gemini — https://aistudio.google.com/apikey → GEMINI_API_KEY
//  3. Cloudflare Workers AI — free daily allowance, and you already have a
//     Cloudflare account. Needs BOTH:
//       CLOUDFLARE_ACCOUNT_ID (dashboard URL / Workers overview)
//       CLOUDFLARE_AI_TOKEN   (My Profile → API Tokens → token with Workers AI read)
//
// PAID:
//  4. Anthropic Claude — https://console.anthropic.com/settings/keys → ANTHROPIC_API_KEY
//
// Providers are tried in order; if one fails the next is used, so a suspended
// key or an outage doesn't take the feature down.

import { readServerEnv } from "./server-env";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_DEFAULT_MODEL = "gemini-2.0-flash";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_DEFAULT_MODEL = "claude-haiku-4-5-20251001";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_DEFAULT_MODEL = "llama-3.3-70b-versatile";
const GROQ_DEFAULT_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const CLOUDFLARE_DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const CLOUDFLARE_DEFAULT_VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

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

// --- Groq (free tier, OpenAI-compatible) ----------------------------------

async function callGroq(apiKey: string, req: AiRequest): Promise<string> {
  const hasImage = req.parts.some((p) => p.kind === "image");
  const model = hasImage
    ? (readServerEnv("GROQ_VISION_MODEL") ?? GROQ_DEFAULT_VISION_MODEL)
    : (readServerEnv("GROQ_MODEL") ?? GROQ_DEFAULT_MODEL);

  const userContent = req.parts.map((part) =>
    part.kind === "text"
      ? { type: "text" as const, text: part.text }
      : {
          type: "image_url" as const,
          image_url: { url: `data:${part.mimeType};base64,${part.base64}` },
        },
  );

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 700,
      messages: [
        // Vision models on Groq don't accept a separate system role reliably,
        // so fold the instructions into the user turn when an image is present.
        ...(hasImage ? [] : [{ role: "system", content: req.system }]),
        {
          role: "user",
          content: hasImage
            ? [{ type: "text" as const, text: req.system }, ...userContent]
            : userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Groq API error (${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}

// --- Cloudflare Workers AI (free daily allowance) -------------------------

async function callCloudflare(
  accountId: string,
  token: string,
  req: AiRequest,
): Promise<string> {
  const hasImage = req.parts.some((p) => p.kind === "image");
  const model = hasImage
    ? (readServerEnv("CLOUDFLARE_VISION_MODEL") ?? CLOUDFLARE_DEFAULT_VISION_MODEL)
    : (readServerEnv("CLOUDFLARE_MODEL") ?? CLOUDFLARE_DEFAULT_MODEL);

  const textPrompt = req.parts
    .filter((p): p is Extract<AiPart, { kind: "text" }> => p.kind === "text")
    .map((p) => p.text)
    .join("\n\n");

  const body: Record<string, unknown> = hasImage
    ? {
        prompt: `${req.system}\n\n${textPrompt}`,
        image: [
          ...Buffer.from(
            (req.parts.find((p) => p.kind === "image") as Extract<AiPart, { kind: "image" }>)
              .base64,
            "base64",
          ),
        ],
        max_tokens: req.maxTokens ?? 700,
      }
    : {
        messages: [
          { role: "system", content: req.system },
          { role: "user", content: textPrompt },
        ],
        max_tokens: req.maxTokens ?? 700,
      };

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(`Cloudflare AI error (${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    result?: { response?: string; description?: string };
    success?: boolean;
    errors?: unknown;
  };

  const text = (data.result?.response ?? data.result?.description ?? "").trim();
  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}

// --- Provider selection ---------------------------------------------------

async function callAi(req: AiRequest): Promise<string> {
  const groqKey = readServerEnv("GROQ_API_KEY");
  const geminiKey = readServerEnv("GEMINI_API_KEY");
  const cfAccount = readServerEnv("CLOUDFLARE_ACCOUNT_ID");
  const cfToken = readServerEnv("CLOUDFLARE_AI_TOKEN");
  const anthropicKey = readServerEnv("ANTHROPIC_API_KEY");

  // Free providers first, paid last.
  const providers: Array<{ name: string; run: () => Promise<string> }> = [];
  if (groqKey) providers.push({ name: "Groq", run: () => callGroq(groqKey, req) });
  if (geminiKey) providers.push({ name: "Gemini", run: () => callGemini(geminiKey, req) });
  if (cfAccount && cfToken)
    providers.push({
      name: "Cloudflare AI",
      run: () => callCloudflare(cfAccount, cfToken, req),
    });
  if (anthropicKey)
    providers.push({ name: "Claude", run: () => callAnthropic(anthropicKey, req) });

  if (providers.length === 0) {
    throw new Error(
      "AI is not set up yet — add a free GROQ_API_KEY or GEMINI_API_KEY environment variable.",
    );
  }

  const failures: string[] = [];
  for (const provider of providers) {
    try {
      return await provider.run();
    } catch (error) {
      failures.push(`${provider.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All AI providers failed — ${failures.join(" | ")}`);
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
