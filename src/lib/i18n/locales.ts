/**
 * The languages the app speaks.
 *
 * Chosen for who actually uses it: English, Spanish, and the languages of the
 * Indian and Pakistani small-business owners this was built for, plus Chinese.
 *
 * Two of them read right to left, which is not a cosmetic difference — the
 * whole layout mirrors, including which side an amount sits on. See `dir`.
 *
 * SHIPPED vs NOT SHIPPED
 * ----------------------
 * `shipped: false` means the language exists here and has a dictionary file,
 * but is not offered in the picker yet because that dictionary is incomplete.
 *
 * A half-translated language is worse than an absent one. Every missing key
 * falls back to English, so the reader gets a screen that is mostly their
 * language with English scattered through it — which reads as the app being
 * broken, and undermines the exact promise the product is sold on.
 *
 * Nothing is deleted. The dictionaries stay, the fonts and RTL handling stay,
 * and finishing a language is a one-word change back to `shipped: true`.
 */

export const LOCALES = {
  en: {
    /** What English speakers call it. */
    label: "English",
    /** What speakers of the language call it — always shown in the picker. */
    native: "English",
    dir: "ltr",
    /** BCP 47 tag, used for number, date and currency formatting. */
    tag: "en-US",
    /** Extra font family needed for this script, if any. */
    font: null,
    /** Offered in the picker. See the note above before flipping this. */
    shipped: true,
  },
  es: {
    label: "Spanish",
    native: "Español",
    dir: "ltr",
    tag: "es",
    font: null,
    shipped: true,
  },
  hi: {
    label: "Hindi",
    native: "हिन्दी",
    dir: "ltr",
    tag: "hi-IN",
    font: '"Noto Sans Devanagari"',
    shipped: true,
  },
  gu: {
    label: "Gujarati",
    native: "ગુજરાતી",
    dir: "ltr",
    tag: "gu-IN",
    font: '"Noto Sans Gujarati"',
    shipped: true,
  },
  ur: {
    label: "Urdu",
    native: "اردو",
    dir: "rtl",
    tag: "ur-PK",
    font: '"Noto Naskh Arabic"',
    // Dictionary is incomplete. The RTL layout work is done and correct —
    // this is waiting on translation only.
    shipped: false,
  },
  zh: {
    label: "Chinese",
    native: "中文",
    dir: "ltr",
    tag: "zh-CN",
    font: '"Noto Sans SC"',
    // Dictionary is incomplete.
    shipped: false,
  },
} as const;

export type Locale = keyof typeof LOCALES;

/** Every language in the table, shipped or not. Mostly for tooling. */
export const ALL_LOCALES = Object.keys(LOCALES) as Locale[];

/**
 * The languages actually offered to a reader.
 *
 * This is what the picker renders, what browser detection may return, and what
 * the marketing copy counts — so the "N languages" claim on the landing page
 * can never drift from what the app really does.
 */
export const LOCALE_LIST = ALL_LOCALES.filter((l) => LOCALES[l].shipped);

export const DEFAULT_LOCALE: Locale = "en";

/** A language in the table — including one not yet offered. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALES;
}

/**
 * A language we're willing to render.
 *
 * Separate from isLocale because a stored choice outlives a release: someone
 * who picked Urdu while it was offered still has "ur" in localStorage. They
 * get English rather than a page of half-translated text.
 */
export function isShippedLocale(value: unknown): value is Locale {
  return isLocale(value) && LOCALES[value].shipped;
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return LOCALES[locale].dir;
}

/**
 * Best guess from the browser's languages.
 *
 * Matches on the base language, so "es-MX" and "es-419" both land on Spanish
 * rather than falling back to English for want of an exact match.
 */
export function detectLocale(preferred: readonly string[]): Locale {
  for (const candidate of preferred) {
    const base = candidate.toLowerCase().split("-")[0];
    // isShippedLocale, not isLocale: a phone set to Urdu should get English
    // rather than a dictionary that's still half English anyway.
    if (isShippedLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
