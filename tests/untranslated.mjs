/**
 * Finds user-visible text that is hard-coded in English.
 *
 * The promise the app makes is "pick a language and the whole app is in it".
 * A single English string in a Gujarati interface breaks that promise more
 * visibly than a missing feature would — it reads as the app forgetting who
 * it is talking to.
 *
 * This walks the components looking for prose that never went through t().
 * It is a heuristic, and it says so: it cannot tell a user-facing string from
 * a CSS class or an aria value with certainty, so it filters hard and reports
 * a floor, not a total. Files listed in ALLOWED are excluded with a reason.
 *
 * Run: node tests/untranslated.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = "src";

/*
 * Files exempt from the sweep, each for a stated reason. "It would be a lot of
 * work" is not a reason — anything parked here should be something that would
 * be WRONG to translate.
 */
const ALLOWED = new Map([
  ["src/routes/privacy.tsx", "legal text: the English version is the operative one"],
  ["src/routes/terms.tsx", "legal text: the English version is the operative one"],
  ["src/components/landing/legal.tsx", "wrapper for the two legal pages"],
  ["src/lib/i18n/en.ts", "the source dictionary itself"],
  ["src/lib/i18n/es.ts", "a dictionary"],
  ["src/lib/i18n/hi.ts", "a dictionary"],
  ["src/lib/i18n/gu.ts", "a dictionary"],
  ["src/lib/i18n/ur.ts", "a dictionary"],
  ["src/lib/i18n/zh.ts", "a dictionary"],
  ["src/lib/i18n/locales.ts", "language names are shown in their own script on purpose"],
]);

/** Strings that look like prose rather than code. */
function looksLikeProse(text) {
  const s = text.trim();
  if (s.length < 12) return false;
  // Needs at least two words and a lower-case run — filters out CONSTANTS,
  // class names, ids, urls, hex, dates and format strings.
  if (!/[a-z]{3}/.test(s)) return false;
  if (!/\s/.test(s)) return false;
  if (/^https?:|^\/|^#|^@|^data:|^image\/|^application\//.test(s)) return false;
  // Tailwind and CSS: long runs of hyphenated tokens, bracket utilities, vars.
  if (/^[a-z0-9:\-\s[\]().,/%_]+$/.test(s) && /(-|\[)/.test(s) && !/[.?!]/.test(s)) return false;
  if (/var\(--|rounded-|text-\[|flex|grid|px-|py-|mt-|gap-/.test(s)) return false;
  // Word-per-word: prose has spaces between real words.
  const words = s.split(/\s+/).filter((w) => /^[A-Za-z''’.,!?—-]+$/.test(w));
  return words.length >= 2;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const findings = [];

for (const file of walk(ROOT)) {
  const rel = file.split(path.sep).join("/");
  if (ALLOWED.has(rel)) continue;

  const src = fs.readFileSync(file, "utf8");

  // Strip comments first: they explain intent in English on purpose.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  const hits = new Set();

  // 1. Quoted strings passed as JSX props that render text.
  for (const m of code.matchAll(
    /\b(title|label|description|placeholder|eyebrow|tagline|cta|question|answer|text|aria-label|heading|body|blurb|summary)\s*=\s*"([^"]{12,})"/g,
  )) {
    if (looksLikeProse(m[2])) hits.add(m[2]);
  }

  // 2. Text sitting directly between JSX tags.
  for (const m of code.matchAll(/>\s*([A-Z][^<>{}\n]{14,})\s*</g)) {
    if (looksLikeProse(m[1])) hits.add(m[1].trim());
  }

  if (hits.size) findings.push({ file: rel, strings: [...hits] });
}

const total = findings.reduce((n, f) => n + f.strings.length, 0);

findings.sort((a, b) => b.strings.length - a.strings.length);

console.log(`\n  Hard-coded English, by file (heuristic — a floor, not a total):\n`);
for (const f of findings) {
  console.log(`  ${String(f.strings.length).padStart(4)}  ${f.file}`);
  for (const s of f.strings.slice(0, 2)) {
    console.log(`        · ${s.length > 76 ? s.slice(0, 76) + "…" : s}`);
  }
}
console.log(`\n  ${total} string(s) across ${findings.length} file(s).`);
console.log(`  Exempt: ${[...ALLOWED.keys()].length} file(s), each with a stated reason.\n`);

// Reported, not enforced — while the gap is being closed, a hard failure here
// would just get muted. Swap to a non-zero exit once this reaches zero.
process.exit(0);
