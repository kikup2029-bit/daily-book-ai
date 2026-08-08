/**
 * The language the app is speaking right now.
 *
 * One provider near the root, one `useI18n()` hook everywhere else. Switching
 * language re-renders the app, flips `dir` on <html> for Urdu, swaps in the font
 * that covers the script, and remembers the choice.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { en, type Dictionary } from "./en";
import { es } from "./es";
import { hi } from "./hi";
import { gu } from "./gu";
import { ur } from "./ur";
import { zh } from "./zh";
import { DEFAULT_LOCALE, LOCALES, detectLocale, isShippedLocale, type Locale } from "./locales";
import { makeTranslator, type PartialDictionary, type Translator } from "./translate";

const DICTIONARIES: Record<Locale, PartialDictionary> = { en, es, hi, gu, ur, zh };

const STORAGE_KEY = "simplebooks.locale";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator;
  dir: "ltr" | "rtl";
  /** BCP 47 tag, for Intl formatting. */
  tag: string;
  /** Money in the reader's locale. Currency stays USD — see the note below. */
  money: (value: number) => string;
  /** Money with an explicit + or −, which never gets dropped. */
  signedMoney: (value: number) => string;
  formatDate: (iso: string, style?: "short" | "long") => string;
  formatNumber: (value: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read the saved choice on the client. Starting from English and correcting
  // avoids a server/client mismatch during hydration.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    // isShippedLocale rather than isLocale: a saved choice outlives a release.
    // Someone who picked Urdu while it was offered still has "ur" here, and
    // restoring it would hand them a page that's half English. They fall back
    // to English until that dictionary is finished.
    if (isShippedLocale(saved)) {
      setLocaleState(saved);
      return;
    }
    // No choice yet: follow the browser, so someone whose phone is in Gujarati
    // sees Gujarati without hunting for a setting.
    const detected = detectLocale(navigator.languages ?? [navigator.language]);
    setLocaleState(detected);
  }, []);

  // Tell the document what language it's in. Screen readers use `lang` to pick
  // a voice, and `dir` is what actually mirrors the layout.
  useEffect(() => {
    const meta = LOCALES[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembering is survivable; the picker still works this session.
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const meta = LOCALES[locale];
    const tag = meta.tag;

    const t = makeTranslator(DICTIONARIES[locale], en as Dictionary, locale, tag, (path) => {
      if (import.meta.env.DEV && locale !== "en") {
        console.warn(`[i18n] ${locale} is missing "${path}" — showing English.`);
      }
    });

    /*
     * Currency stays USD while the *formatting* follows the language.
     *
     * Translating the language doesn't change what's in the till. Silently
     * relabelling $400 as €400 or ₹400 would misstate someone's takings, which
     * is far worse than an unfamiliar symbol. Digit grouping and decimal marks
     * do follow the locale, because those are presentation.
     */
    const currency = new Intl.NumberFormat(tag, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const plain = new Intl.NumberFormat(tag);

    const money = (input: number) => currency.format(Number.isFinite(input) ? input : 0);

    return {
      locale,
      setLocale,
      t,
      dir: meta.dir,
      tag,
      money,
      // The sign is part of the meaning, not decoration, so it's applied here
      // and survives every locale and every export.
      signedMoney: (input: number) =>
        `${input >= 0 ? "+" : "−"}${money(Math.abs(Number.isFinite(input) ? input : 0))}`,
      formatDate: (iso: string, style: "short" | "long" = "short") => {
        const date = new Date(`${iso}T00:00:00`);
        if (Number.isNaN(date.getTime())) return iso;
        return date.toLocaleDateString(
          tag,
          style === "long"
            ? { weekday: "long", month: "long", day: "numeric" }
            : { month: "short", day: "numeric" },
        );
      },
      formatNumber: (input: number) => plain.format(Number.isFinite(input) ? input : 0),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside <I18nProvider>. Check the root route.");
  }
  return value;
}

/** Shorthand for the common case of only needing the translator. */
export function useT(): Translator {
  return useI18n().t;
}

export { LOCALES, LOCALE_LIST, ALL_LOCALES, isShippedLocale, type Locale } from "./locales";
