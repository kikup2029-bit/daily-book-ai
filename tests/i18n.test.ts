import { en } from "../src/lib/i18n/en.ts";
import { es } from "../src/lib/i18n/es.ts";
import { hi } from "../src/lib/i18n/hi.ts";
import { gu } from "../src/lib/i18n/gu.ts";
import { ur } from "../src/lib/i18n/ur.ts";
import { zh } from "../src/lib/i18n/zh.ts";
import { LOCALES, detectLocale, isLocale } from "../src/lib/i18n/locales.ts";
import { collectPaths, interpolate, makeTranslator, missingKeys } from "../src/lib/i18n/translate.ts";

let pass = 0, fail = 0;
const ok = (c: boolean, l: string) => { if (c) pass++; else { fail++; console.log("FAIL: " + l); } };
const eq = (a: unknown, b: unknown, l: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${l} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};

const LANGS = [["es", es], ["hi", hi], ["gu", gu], ["ur", ur], ["zh", zh]] as const;

/*
 * Keys added since the last translation pass.
 *
 * These fall back to English per key at runtime, which is correct and visible
 * rather than broken. Listing them here keeps the suite honest: the count is
 * the size of the translation debt, and it should trend to zero.
 */
// Empty, and it should stay that way. A key parked here renders in English for
// everyone — which, in a nav bar, looks like a bug rather than a gap.
const PENDING_TRANSLATION = new Set<string>([]);

// --- completeness: no locale may be missing a key
for (const [name, dict] of LANGS) {
  const missing = missingKeys(dict, en).filter((k) => !PENDING_TRANSLATION.has(k));
  eq(missing, [], `${name} has every key (bar ${PENDING_TRANSLATION.size} awaiting translation)`);
}

/*
 * Keys that are meant to stay identical across languages.
 *
 *  - Email placeholders are addresses, not prose. Localising them would be
 *    wrong in every language.
 *  - The quick-add placeholder shows what the parser accepts, and the parser
 *    only understands English input. Translating it would demonstrate syntax
 *    that silently fails.
 */
const LANGUAGE_NEUTRAL = new Set([
  "auth.emailPlaceholder",
  "invoices.customerEmailPlaceholder",
  "dashboard.quickAddPlaceholder",
]);

// --- no English left in a translation (a copy-paste tell)
for (const [name, dict] of LANGS) {
  const english = new Map(collectPaths(en).map((p) => [p, read(en, p)]));
  let identical = 0;
  for (const path of collectPaths(dict)) {
    const value = read(dict, path);
    // Short shared tokens are legitimately identical across languages.
    if (LANGUAGE_NEUTRAL.has(path)) continue;
    if (typeof value === "string" && value.length > 12 && value === english.get(path)) identical++;
  }
  ok(identical === 0, `${name} has no untranslated English sentences (found ${identical})`);
}

function read(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (n, k) => (n && typeof n === "object" ? (n as Record<string, unknown>)[k] : undefined),
    source,
  );
}

// --- placeholders must survive translation, or a name/amount vanishes on screen
const placeholders = (text: string) => (text.match(/\{(\w+)\}/g) ?? []).sort();
for (const [name, dict] of LANGS) {
  let broken: string[] = [];
  for (const path of collectPaths(en)) {
    const source = read(en, path);
    const target = read(dict, path);
    if (typeof source !== "string" || typeof target !== "string") continue;
    if (JSON.stringify(placeholders(source)) !== JSON.stringify(placeholders(target))) {
      broken.push(path);
    }
  }
  eq(broken, [], `${name} keeps every {placeholder}`);
}

// --- interpolation
eq(interpolate("{count} entries", { count: 3 }), "3 entries", "substitutes a value");
eq(interpolate("no placeholders"), "no placeholders", "leaves plain text alone");
eq(interpolate("{missing} here", {}), "{missing} here",
   "an unsupplied value stays visible rather than printing undefined");
eq(interpolate("{a} and {b}", { a: "x", b: "y" }), "x and y", "handles several");

// --- plural selection
{
  const t = makeTranslator(es, en, "es", "es");
  ok(t("entries.count", { count: 1 }).includes("1"), "singular renders");
  ok(t("entries.count", { count: 5 }).includes("5"), "plural renders");
  ok(t("entries.count", { count: 1 }) !== t("entries.count", { count: 5 }),
     "Spanish singular and plural actually differ");
}
{
  // Chinese supplies only _other; every count must still resolve.
  const t = makeTranslator(zh, en, "zh", "zh-CN");
  const one = t("entries.count", { count: 1 });
  const many = t("entries.count", { count: 9 });
  ok(!one.includes("entries.count"), "Chinese resolves a count of 1 despite having no _one form");
  ok(one.includes("1") && many.includes("9"), "…and interpolates the number");
}

// --- fallback: a missing key shows English, not a blank or a raw key
{
  const partial = { common: { save: "PROBADO" } };
  const t = makeTranslator(partial, en, "es", "es");
  eq(t("common.save"), "PROBADO", "uses the translation when present");
  eq(t("common.cancel"), en.common.cancel, "falls back to English per key, not per file");
  eq(t("nope.nothing"), "nope.nothing", "an unknown key shows itself rather than going blank");
}

// --- locale metadata
ok(LOCALES.ur.dir === "rtl", "Urdu is right-to-left");
ok(LOCALES.ar === undefined, "Arabic isn't claimed — it was never translated");
ok(Object.values(LOCALES).every((l) => l.native.length > 0), "every language names itself in its own script");
ok(LOCALES.gu.native === "ગુજરાતી", "Gujarati is offered in Gujarati script");
ok(LOCALES.hi.font !== null && LOCALES.gu.font !== null && LOCALES.zh.font !== null,
   "non-Latin scripts each declare a font, or they render as empty boxes");
eq(detectLocale(["es-MX", "en"]), "es", "a regional tag matches its base language");
eq(detectLocale(["fr-CA"]), "en", "an unsupported language falls back to English");
eq(detectLocale([]), "en", "no preference falls back to English");
ok(isLocale("gu") && !isLocale("xx"), "locale guard works");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
