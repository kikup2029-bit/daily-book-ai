/*
 * Does anything render underneath the iPhone's clock and battery?
 *
 * The app ships with viewport-fit=cover, which is what lets an installed copy
 * paint edge to edge and feel like an app instead of a web page. The cost is
 * that iOS stops reserving space for you: the notch, the Dynamic Island and the
 * home indicator all sit ON TOP of the page, and every screen has to pad itself
 * back out of the way.
 *
 * Nothing about that is visible on a desktop browser, in a simulator set to a
 * non-notched device, or in any screenshot taken on a Mac. It only shows up on
 * real hardware, which is exactly why it stayed broken: the helpers existed in
 * styles.css from the beginning, and for months the ONLY file that used them was
 * app-topnav.tsx. Every screen outside the signed-in shell — sign-in, the lock
 * screen, the post-signup Pro offer, the landing header, checkout results —
 * drew its first line of text under the status bar.
 *
 * So this file encodes the rule rather than trusting anyone to remember it.
 *
 * The three checks:
 *   1. A full-height screen must guard both edges.
 *   2. An element pinned to a viewport edge must guard that edge.
 *   3. .pt-safe must never share an element with a Tailwind top-padding class.
 *
 * That third one is subtle and worth spelling out. Both .pt-safe and Tailwind's
 * py-10 declare padding-top inside @layer utilities, so which one wins comes
 * down to the order the build happens to emit them in. "pt-safe py-10" is a coin
 * flip between 40px and the device inset, and it resolves the wrong way on
 * precisely one class of hardware. Use .screen-y instead, which owns both
 * numbers so they cannot disagree.
 */

import fs from "node:fs";
import path from "node:path";

let pass = 0;
const failures = [];
const ok = (cond, label) => {
  if (cond) pass++;
  else failures.push(label);
};

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".tsx")) files.push(full);
  }
})("src");

/*
 * Wrappers that are full-height but deliberately own no padding, because the
 * chrome they contain guards the edges instead. Each one has to name the
 * element that actually does the guarding, so an exemption can be checked
 * rather than taken on trust.
 */
const DELEGATES = {
  "src/components/landing/landing-shell.tsx": "LandingHeader has pt-safe, LandingFooter has pb-safe",
  "src/components/app-topnav.tsx": "the sticky header has pt-safe and <main> has pb-page",
  "src/routes/auth.tsx": "the <main> form column carries screen-y",
};

/** Pull out every className="..." string, with its line number and raw line. */
function classNames(source) {
  const found = [];
  const lines = source.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{cn\(\s*"([^"]*)")/g)) {
      found.push({ value: m[1] ?? m[2] ?? m[3] ?? "", line: i + 1, raw: line });
    }
    // cva() variant maps and other bare class strings in styling files.
    for (const m of line.matchAll(/^\s*(?:\w+:\s*)?"((?:[a-z0-9:[\]/_.-]+\s+){2,}[^"]*)"/g)) {
      found.push({ value: m[1], line: i + 1, raw: line });
    }
  });
  return found;
}

/*
 * Does this class string set padding on `edge` by some route OTHER than the
 * safe-area helper?
 *
 * Written as an explicit scan rather than one regex because the obvious regex
 * — /(p|py|pt)-[\w-]+/ — matches "pt-safe" itself, so the check reported every
 * correctly-guarded element as a collision. Splitting into tokens and dropping
 * the helpers first is harder to fool.
 */
function paddingCollision(cls, edge) {
  const prefixes = edge === "top" ? ["p-", "py-", "pt-"] : ["p-", "py-", "pb-"];
  return cls
    .split(/\s+/)
    .filter((token) => token !== "pt-safe" && token !== "pb-safe" && token !== "pb-page")
    // Responsive and state variants (sm:pt-4) land on the same element too.
    .map((token) => token.replace(/^[\w-]+:/, ""))
    .find((token) => prefixes.some((p) => token.startsWith(p)));
}

const has = (cls, name) => new RegExp(`(^|\\s)${name}(\\s|$)`).test(cls);

for (const file of files) {
  const rel = file.replace(/\\/g, "/");
  const source = fs.readFileSync(file, "utf8");

  for (const { value: cls, line, raw } of classNames(source)) {
    const where = `${rel}:${line}`;

    const guardsTop = has(cls, "pt-safe") || has(cls, "screen-y");
    const guardsBottom = has(cls, "pb-safe") || has(cls, "screen-y") || has(cls, "pb-page");

    // --- 1. full-height screens ------------------------------------------
    if (has(cls, "min-h-screen") || has(cls, "h-screen") || has(cls, "h-svh")) {
      if (DELEGATES[rel]) {
        pass++; // Exempt, and the reason is recorded above.
      } else {
        ok(
          guardsTop && guardsBottom,
          `${where} is a full-height screen but doesn't guard both edges. ` +
            `Add "screen-y". Found: "${cls}"`,
        );
      }
    }

    // --- 2. elements pinned to a viewport edge ---------------------------
    /*
     * `fixed` is always relative to the viewport, so it always counts.
     *
     * `sticky` is not: it sticks to its nearest scrolling ancestor, which is
     * usually a panel. The export page has `sticky top-0` and `sticky bottom-0`
     * rows inside a max-h-72 overflow-auto box — they never come near the
     * screen edge, and an earlier version of this check failed them both. So a
     * sticky element only counts when it's a <header>, which in this app is the
     * one thing that sticks to the page itself.
     */
    const pinned = has(cls, "fixed") || (has(cls, "sticky") && /<header/.test(raw));
    // inset-0 overlays are usually bare scrims whose child does the padding,
    // and the child is checked on its own line.
    const isScrim = has(cls, "inset-0") && /bg-black\//.test(cls);

    if (pinned && !isScrim) {
      if (has(cls, "top-0") && !guardsTop && !has(cls, "inset-y-0")) {
        ok(false, `${where} is pinned to top-0 without pt-safe. Found: "${cls}"`);
      }
      if (has(cls, "bottom-0") && !guardsBottom && !has(cls, "inset-y-0")) {
        ok(false, `${where} is pinned to bottom-0 without pb-safe. Found: "${cls}"`);
      }
      if (has(cls, "inset-y-0") && !(guardsTop && guardsBottom)) {
        ok(false, `${where} spans inset-y-0 without guarding both edges. Found: "${cls}"`);
      }
    }

    // --- 3. the padding collision ----------------------------------------
    for (const [helper, edge] of [
      ["pt-safe", "top"],
      ["pb-safe", "bottom"],
    ]) {
      if (!has(cls, helper)) continue;
      const collision = paddingCollision(cls, edge);
      ok(
        !collision,
        `${where} puts ${helper} next to "${collision}". Both set padding-${edge} in the ` +
          `same CSS layer, so the winner depends on build order. Use screen-y instead. ` +
          `Found: "${cls}"`,
      );
    }
  }
}

// --- the helpers themselves have to exist and be additive -----------------
{
  const css = fs.readFileSync("src/styles.css", "utf8");
  for (const name of ["pt-safe", "pb-safe", "pb-page", "screen-y", "top-corner-safe"]) {
    ok(css.includes(`.${name}`), `styles.css is missing the .${name} helper`);
  }
  // screen-y must ADD the inset to its base padding, never replace it.
  const screenY = /\.screen-y\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  ok(
    /padding-top:\s*calc\([^)]*\+\s*env\(safe-area-inset-top/.test(screenY),
    "screen-y must add env(safe-area-inset-top) to its base padding, not replace it",
  );
  ok(
    /padding-bottom:\s*calc\([^)]*\+\s*env\(safe-area-inset-bottom/.test(screenY),
    "screen-y must add env(safe-area-inset-bottom) to its base padding, not replace it",
  );
}

// --- viewport-fit=cover is what makes all of this necessary ---------------
{
  const root = fs.readFileSync("src/routes/__root.tsx", "utf8");
  ok(
    root.includes("viewport-fit=cover"),
    "viewport-fit=cover is missing — without it iOS letterboxes the app and the " +
      "safe-area helpers all resolve to 0",
  );
}

for (const f of failures) console.log("FAIL: " + f);
console.log(`\n${pass} passed, ${failures.length} failed`);
process.exit(failures.length === 0 ? 0 : 1);
