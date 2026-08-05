/**
 * Turns a typed line like "spent 42.50 at costco on groceries" into a filled-in
 * entry. Pure functions, no AI service — so it's instant, free, and works
 * offline. It learns categories from the owner's own past entries.
 */

export type QuickEntryHistory = {
  spent_on: string | null;
  merchant?: string | null;
};

export type ParsedEntry = {
  /** Money coming in, if the text described income. */
  amountIn: number;
  /** Money going out, if the text described a spend. */
  amountOut: number;
  category: string | null;
  merchant: string | null;
  /** ISO date; defaults to today unless the text said otherwise. */
  date: string;
  /** True when we found an amount — without one there's nothing to save. */
  ok: boolean;
  /** Which direction we decided, and whether we were told or guessed. */
  direction: "in" | "out";
  directionExplicit: boolean;
  /** Human-readable note about what we understood, for the preview. */
  summary: string;
};

// --- direction words ------------------------------------------------------

const IN_WORDS = [
  "made",
  "earned",
  "sold",
  "received",
  "got paid",
  "got",
  "took in",
  "income",
  "revenue",
  "deposit",
  "sale",
  "sales",
  "in",
];

const OUT_WORDS = [
  "spent",
  "spend",
  "paid",
  "bought",
  "buy",
  "cost",
  "purchase",
  "purchased",
  "expense",
  "bill",
  "out",
];

// --- built-in category hints ---------------------------------------------
// Only used when the owner's own history has nothing to say.
const KEYWORD_CATEGORIES: Array<{ category: string; words: string[] }> = [
  {
    category: "Food",
    words: [
      "lunch",
      "dinner",
      "breakfast",
      "coffee",
      "cafe",
      "restaurant",
      "takeout",
      "snack",
      "pizza",
      "burger",
      "starbucks",
      "mcdonalds",
      "chipotle",
    ],
  },
  {
    category: "Groceries",
    words: [
      "groceries",
      "grocery",
      "supermarket",
      "costco",
      "walmart",
      "kroger",
      "aldi",
      "trader joes",
      "safeway",
      "produce",
    ],
  },
  {
    category: "Transport",
    words: [
      "gas",
      "fuel",
      "petrol",
      "shell",
      "chevron",
      "uber",
      "lyft",
      "taxi",
      "bus",
      "train",
      "parking",
      "toll",
    ],
  },
  {
    category: "Rent",
    words: ["rent", "lease", "landlord", "mortgage"],
  },
  {
    category: "Utilities",
    words: [
      "electric",
      "electricity",
      "water",
      "internet",
      "wifi",
      "phone",
      "gas bill",
      "power",
      "utility",
      "utilities",
    ],
  },
  {
    category: "Supplies",
    words: [
      "supplies",
      "supply",
      "materials",
      "packaging",
      "boxes",
      "bags",
      "stationery",
      "staples",
      "home depot",
      "lowes",
    ],
  },
  {
    category: "Inventory",
    words: ["inventory", "stock", "wholesale", "resale"],
  },
  {
    category: "Subscriptions",
    words: [
      "subscription",
      "netflix",
      "spotify",
      "adobe",
      "canva",
      "membership",
      "software",
      "saas",
    ],
  },
  {
    category: "Entertainment",
    words: ["movie", "cinema", "concert", "game", "games", "bar", "drinks"],
  },
  {
    category: "Marketing",
    words: ["ads", "advert", "advertising", "marketing", "flyers", "promo"],
  },
  {
    category: "Equipment",
    words: ["equipment", "machine", "tool", "tools", "laptop", "printer", "oven"],
  },
  {
    category: "Taxes",
    words: ["tax", "taxes", "irs", "hmrc"],
  },
];

// --- helpers --------------------------------------------------------------

const todayISO = () => new Date().toLocaleDateString("en-CA");

function shiftDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Suggests a category for some text, preferring what the owner has actually
 * done before over the built-in dictionary.
 */
export function suggestCategory(
  text: string,
  history: QuickEntryHistory[] = [],
  knownCategories: string[] = [],
): string | null {
  const lower = ` ${text.toLowerCase()} `;

  // 1. A category name they already use, mentioned directly.
  const fromKnown = knownCategories.find(
    (cat) => cat.trim() && lower.includes(` ${cat.toLowerCase()} `),
  );
  if (fromKnown) return fromKnown;

  // Same, but allowing it to appear as a substring (e.g. "groceries" in
  // "groceries," or as part of a longer word).
  const fromKnownLoose = knownCategories.find(
    (cat) => cat.trim().length >= 4 && lower.includes(cat.toLowerCase()),
  );
  if (fromKnownLoose) return fromKnownLoose;

  // 2. A merchant they've used before → reuse the category they gave it.
  //    Most recent wins, so a re-categorisation sticks.
  for (const past of history) {
    const merchant = past.merchant?.trim().toLowerCase();
    if (!merchant || merchant.length < 3) continue;
    if (lower.includes(merchant) && past.spent_on?.trim()) {
      return past.spent_on.trim();
    }
  }

  // 3. Built-in keyword hints.
  for (const { category, words } of KEYWORD_CATEGORIES) {
    if (words.some((word) => lower.includes(word))) return category;
  }

  return null;
}

/**
 * Parses a free-text money line.
 *
 * Understands things like:
 *   "spent 42.50 at costco on groceries"
 *   "18 lunch"
 *   "made 300 today"
 *   "paid 800 rent yesterday"
 *   "-25 fuel"
 *   "+150 sales"
 */
export function parseQuickEntry(
  raw: string,
  options: {
    history?: QuickEntryHistory[];
    knownCategories?: string[];
    today?: string;
    /** Direction to assume when the text doesn't say. Defaults to "out". */
    defaultDirection?: "in" | "out";
  } = {},
): ParsedEntry {
  const history = options.history ?? [];
  const knownCategories = options.knownCategories ?? [];
  const today = options.today ?? todayISO();
  const text = raw.trim();
  const lower = ` ${text.toLowerCase()} `;

  const empty: ParsedEntry = {
    amountIn: 0,
    amountOut: 0,
    category: null,
    merchant: null,
    date: today,
    ok: false,
    direction: options.defaultDirection ?? "out",
    directionExplicit: false,
    summary: "Type something like “spent 20 on supplies”.",
  };
  if (!text) return empty;

  // --- amount ---
  // Grab the first number, allowing $, commas and a leading sign.
  const amountMatch = text.match(/([+-])?\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!amountMatch) {
    return { ...empty, summary: "I couldn't find an amount in that." };
  }
  const sign = amountMatch[1] ?? null;
  const amount = Number(amountMatch[2].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ...empty, summary: "That amount doesn't look right." };
  }

  // --- date ---
  let date = today;
  if (/\byesterday\b/.test(lower)) {
    date = options.today
      ? (() => {
          const d = new Date(`${options.today}T00:00:00`);
          d.setDate(d.getDate() - 1);
          return d.toLocaleDateString("en-CA");
        })()
      : shiftDays(-1);
  }
  const explicitDate = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (explicitDate) date = explicitDate[1];

  // --- direction ---
  let direction: "in" | "out" = options.defaultDirection ?? "out";
  let directionExplicit = false;

  if (sign === "+") {
    direction = "in";
    directionExplicit = true;
  } else if (sign === "-") {
    direction = "out";
    directionExplicit = true;
  } else {
    const inHit = IN_WORDS.find((word) => lower.includes(` ${word} `));
    const outHit = OUT_WORDS.find((word) => lower.includes(` ${word} `));
    // If both appear ("spent 20, made 50"), trust whichever comes first.
    if (inHit && outHit) {
      direction = lower.indexOf(` ${inHit} `) < lower.indexOf(` ${outHit} `) ? "in" : "out";
      directionExplicit = true;
    } else if (inHit) {
      direction = "in";
      directionExplicit = true;
    } else if (outHit) {
      direction = "out";
      directionExplicit = true;
    }
  }

  // --- merchant (after "at" or "from") ---
  let merchant: string | null = null;
  const merchantMatch = text.match(
    /\b(?:at|from)\s+([a-z0-9'&.\- ]+?)(?=\s+(?:on|for|yesterday|today)\b|[,.]|$)/i,
  );
  if (merchantMatch) {
    const candidate = merchantMatch[1].trim();
    if (candidate && !/^\d+$/.test(candidate)) merchant = titleCase(candidate);
  }

  // --- category ---
  // An explicit "on X" / "for X" wins over guessing.
  let category: string | null = null;
  const explicitCategory = text.match(
    /\b(?:on|for)\s+([a-z0-9'&.\- ]+?)(?=\s+(?:at|from|yesterday|today)\b|[,.]|$)/i,
  );
  if (explicitCategory) {
    const candidate = explicitCategory[1].trim();
    if (candidate && !/^\d+$/.test(candidate)) {
      // Match it to an existing category name if we can, so casing stays tidy.
      const existing = knownCategories.find((cat) => cat.toLowerCase() === candidate.toLowerCase());
      category = existing ?? titleCase(candidate);
    }
  }

  if (!category) {
    category = suggestCategory(text, history, knownCategories);
  }

  // Last resort for a bare "18 lunch": treat leftover words as the category.
  if (!category && direction === "out") {
    const leftover = text
      .replace(amountMatch[0], " ")
      .replace(/\b(?:yesterday|today)\b/gi, " ")
      .replace(/\b(?:\d{4}-\d{2}-\d{2})\b/g, " ")
      .replace(new RegExp(`\\b(?:${[...IN_WORDS, ...OUT_WORDS].join("|")})\\b`, "gi"), " ")
      .replace(/\b(?:at|from|on|for|a|an|the)\b/gi, " ")
      .replace(/[^a-z0-9'&.\- ]/gi, " ")
      .trim();
    if (leftover && leftover.length <= 40) category = titleCase(leftover);
  }

  const amountIn = direction === "in" ? amount : 0;
  const amountOut = direction === "out" ? amount : 0;

  const parts: string[] = [];
  parts.push(
    direction === "in" ? `Money in $${amount.toFixed(2)}` : `Money out $${amount.toFixed(2)}`,
  );
  if (category) parts.push(category);
  if (merchant) parts.push(`at ${merchant}`);
  if (date !== today) parts.push(`on ${date}`);

  return {
    amountIn,
    amountOut,
    category,
    merchant,
    date,
    ok: true,
    direction,
    directionExplicit,
    summary: parts.join(" · "),
  };
}
