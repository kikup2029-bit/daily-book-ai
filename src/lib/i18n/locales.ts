/**
 * The languages the app speaks.
 *
 * Chosen for who actually uses it: English, Spanish, and the languages of the
 * Indian and Pakistani small-business owners this was built for, plus Chinese.
 *
 * Two of them read right to left, which is not a cosmetic difference — the
 * whole layout mirrors, including which side an amount sits on. See `dir`.
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
  },
  es: {
    label: "Spanish",
    native: "Español",
    dir: "ltr",
    tag: "es",
    font: null,
  },
  hi: {
    label: "Hindi",
    native: "हिन्दी",
    dir: "ltr",
    tag: "hi-IN",
    font: '"Noto Sans Devanagari"',
  },
  gu: {
    label: "Gujarati",
    native: "ગુજરાતી",
    dir: "ltr",
    tag: "gu-IN",
    font: '"Noto Sans Gujarati"',
  },
  ur: {
    label: "Urdu",
    native: "اردو",
    dir: "rtl",
    tag: "ur-PK",
    font: '"Noto Naskh Arabic"',
  },
  zh: {
    label: "Chinese",
    native: "中文",
    dir: "ltr",
    tag: "zh-CN",
    font: '"Noto Sans SC"',
  },
} as const;

export type Locale = keyof typeof LOCALES;

export const LOCALE_LIST = Object.keys(LOCALES) as Locale[];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALES;
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
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
