/**
 * Looking up a translated string, and the awkward bits that come with it.
 *
 * Pure functions so the plural and placeholder rules can be tested directly —
 * they're the part most likely to be quietly wrong in a language nobody on the
 * team reads.
 */

import type { Dictionary } from "./en";
import type { Locale } from "./locales";

/**
 * A dictionary that may be incomplete, which is the normal state of a translation.
 *
 * Leaf values widen to `string`: `en` is `as const`, so `Partial<Dictionary[K]>`
 * would demand the literal English text and no translation could ever satisfy
 * it. Key names are still checked, so a typo or an invented key is caught.
 */
export type PartialDictionary = {
  [K in keyof Dictionary]?: { [P in keyof Dictionary[K]]?: string };
};

export type Values = Record<string, string | number>;

/**
 * Plural category for a count.
 *
 * English has two forms; several of these languages don't. Arabic and Urdu in
 * particular distinguish more cases than "one" and "other", so the choice is
 * delegated to Intl rather than assumed. Where a translation only supplies
 * `_other`, that's what everything falls back to — which is correct for
 * Chinese, where the noun doesn't change at all.
 */
export function pluralCategory(locale: Locale, count: number, tag: string): string {
  try {
    return new Intl.PluralRules(tag).select(count);
  } catch {
    return count === 1 ? "one" : "other";
  }
}

/**
 * Substitutes {placeholders}.
 *
 * A missing value leaves the placeholder visibly intact rather than printing
 * "undefined" — an obviously broken string is easier to spot and report than a
 * plausible-looking wrong one.
 */
export function interpolate(template: string, values?: Values): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type Path = string;

/** Walks "invoices.title" style paths. */
function read(source: unknown, path: Path): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined,
      source,
    );
}

export type Translator = (path: Path, values?: Values) => string;

/**
 * Builds the `t` function for a locale.
 *
 * Falls back to English per key, not per file, so a half-finished translation
 * shows translated text where it exists and English where it doesn't — rather
 * than reverting the whole app to English because one string is missing.
 */
export function makeTranslator(
  dictionary: PartialDictionary,
  fallback: Dictionary,
  locale: Locale,
  tag: string,
  onMissing?: (path: Path) => void,
): Translator {
  return (path, values) => {
    // A count means the key might have plural variants.
    if (values && typeof values.count === "number") {
      const category = pluralCategory(locale, values.count, tag);
      const candidates = [`${path}_${category}`, `${path}_other`, path];
      for (const candidate of candidates) {
        const found = read(dictionary, candidate) ?? read(fallback, candidate);
        if (typeof found === "string") return interpolate(found, values);
      }
    }

    const translated = read(dictionary, path);
    if (typeof translated === "string") return interpolate(translated, values);

    const english = read(fallback, path);
    if (typeof english === "string") {
      onMissing?.(path);
      return interpolate(english, values);
    }

    // Neither language has it: show the key. Loud, but never a blank space
    // where a button label should be.
    onMissing?.(path);
    return path;
  };
}

/** Every leaf path in a dictionary, for the completeness check. */
export function collectPaths(source: unknown, prefix = ""): string[] {
  if (typeof source === "string") return [prefix];
  if (!source || typeof source !== "object") return [];
  return Object.entries(source as Record<string, unknown>).flatMap(([key, value]) =>
    collectPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

/** Which keys a translation is missing, ignoring plural variants it doesn't need. */
export function missingKeys(dictionary: PartialDictionary, fallback: Dictionary): string[] {
  const required = collectPaths(fallback);
  const present = new Set(collectPaths(dictionary));
  return required.filter((path) => {
    if (present.has(path)) return false;
    // A plural form is satisfied by any variant of the same base key: a
    // language with one plural form legitimately has fewer keys than English.
    const pluralBase = path.match(/^(.*)_(one|other|two|few|many|zero)$/);
    if (pluralBase) {
      return ![...present].some((candidate) => candidate.startsWith(`${pluralBase[1]}_`));
    }
    return true;
  });
}
