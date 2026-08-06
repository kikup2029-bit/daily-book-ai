/**
 * ESTIMATE ONLY — an early warning, not proof.
 *
 * Character counts against calibrated constants. It cannot account for the
 * real font file, font-feature settings, sub-pixel metrics, user zoom, or a
 * fallback face rendering before Inter loads. A pass means "no obvious
 * regression", NOT "verified to fit".
 *
 * It does test BOTH sides of every boundary. Tailwind breakpoints are
 * min-width, so `navbar:flex` applies at exactly 1180 and not at 1179. Testing
 * only the wide side would miss the failures that actually bite: two states
 * active at once, neither active, or a stage that silently never engages.
 */
import fs from "node:fs";

const nav = fs.readFileSync("src/components/app-topnav.tsx", "utf8");
const css = fs.readFileSync("src/styles.css", "utf8");

let pass = 0, fail = 0;
const ok = (c, l) => { if (c) pass++; else { fail++; console.log("  FAIL " + l); } };
const bp = (n) => Number(css.match(new RegExp(`--breakpoint-${n}:\\s*(\\d+)px`))?.[1] ?? 0);

const NAVBAR = bp("navbar"), LABEL = bp("navlabel"), GAP = bp("navgap"), KBD = bp("navkbd");
ok(NAVBAR && LABEL && GAP && KBD, "all four breakpoints defined");
ok(NAVBAR < LABEL && LABEL < GAP && GAP < KBD, "breakpoints ascend");

const navBlock = nav.slice(nav.indexOf("const NAV"), nav.indexOf("function useCoarsePointer"));
const labels = [...navBlock.matchAll(/^  \{\n    label: "([^"]+)"/gm)].map((m) => m[1]);

const CHAR = 7.8, CHEV = 14, BRAND = 150, THEME = 36, SIGNOUT = 86, GUTTERS = 48;

/** Everything the bar does at a given width. min-width semantics: >= applies. */
function stateAt(w) {
  return {
    barVisible: w >= NAVBAR,
    hamburgerVisible: w < NAVBAR,
    searchLabelVisible: w >= LABEL,
    looseGaps: w >= GAP,
    kbdVisible: w >= KBD,
  };
}

function widthNeeded(s) {
  const itemPad = s.looseGaps ? 24 : 20;
  const itemGap = s.looseGaps ? 4 : 2;
  const groups = labels.reduce((sum, l) => sum + l.length * CHAR + itemPad + CHEV + itemGap, 0);
  const search = 14 + 8 + 20 + (s.searchLabelVisible ? 55 : 0) + (s.kbdVisible ? 56 : 0);
  return Math.round(groups + BRAND + search + THEME + SIGNOUT + GUTTERS);
}

const describe = (s) =>
  s.hamburgerVisible
    ? "hamburger"
    : [
        "bar",
        s.searchLabelVisible ? "search label" : "search icon only",
        s.looseGaps ? "loose gaps" : "tight gaps",
        s.kbdVisible ? "⌘K" : "no ⌘K",
      ].join(" · ");

console.log(`  groups: ${labels.join(" | ")}\n`);
console.log("  Both sides of every boundary:\n");

for (const edge of [NAVBAR, LABEL, GAP, KBD]) {
  for (const w of [edge - 1, edge]) {
    const s = stateAt(w);
    const need = s.barVisible ? widthNeeded(s) : 0;
    const spare = s.barVisible ? w - need : null;
    console.log(
      `  ${String(w).padStart(4)}px  ${describe(s).padEnd(44)}` +
        (s.barVisible ? `needs ${need}px → ${spare}px spare` : "—"),
    );

    // Exactly one navigation, never both, never neither.
    ok(s.barVisible !== s.hamburgerVisible, `${w}px: exactly one navigation is shown`);
    if (s.barVisible) {
      ok(spare >= 0, `${w}px: the bar fits`);
      ok(spare >= 80, `${w}px: 80px+ breathing room`);
    }
  }
  console.log("");
}

// Each stage must actually change something across its own boundary, or the
// breakpoint is dead weight and the compression never happens.
const changes = (edge, key) => stateAt(edge - 1)[key] !== stateAt(edge)[key];
ok(changes(KBD, "kbdVisible"), "the ⌘K badge really appears/disappears across navkbd");
ok(changes(GAP, "looseGaps"), "gaps really change across navgap");
ok(changes(LABEL, "searchLabelVisible"), "the search label really changes across navlabel");
ok(changes(NAVBAR, "barVisible"), "the navigation really swaps across navbar");

// And no two stages may fire at the same width, or a single drag would jump
// two states at once and read as a flash.
const edges = [NAVBAR, LABEL, GAP, KBD];
ok(new Set(edges).size === edges.length, "no two stages share a breakpoint");

// Wiring.
ok(/navkbd:block/.test(nav), "⌘K chip gated on navkbd");
ok(/navgap:gap-1/.test(nav) && /navgap:px-3/.test(nav), "gap and padding both step at navgap");
ok(/sr-only navlabel:not-sr-only/.test(nav),
   "search word is sr-only below navlabel and visible above — never removed from the DOM");
ok(/aria-label="Search or jump to a page"/.test(nav), "search has an explicit aria-label");
ok(/title="Search or jump to a page \(⌘K\)"/.test(nav), "…and a tooltip naming the shortcut");
ok((nav.match(/navbar:(flex|hidden|block)/g) ?? []).length === 4,
   "all four nav controls switch together");
ok(!/\blg:(flex|hidden|block)\b/.test(nav), "no stray lg: controlling the switch");

console.log("  NOTE: estimate only. Confirm in a browser at both sides of each");
console.log("  boundary: 1179/1180, 1219/1220, 1259/1260, 1299/1300 — watching for");
console.log("  one-pixel flashes and whether each transition feels natural.");
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
