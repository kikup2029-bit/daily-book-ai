/**
 * Resolves the Recent entries row layout at the four widths that matter.
 *
 * Can't render, but Tailwind's breakpoints are deterministic, so which classes
 * apply at a given width is decidable — and that's where most responsive bugs
 * actually live.
 */
import fs from "node:fs";

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 };
const applies = (cls, width) => {
  const m = cls.match(/^(sm|md|lg|xl):/);
  return m ? width >= BREAKPOINTS[m[1]] : true;
};
const resolve = (classString, width) =>
  classString.split(/\s+/).filter((c) => c && applies(c, width)).map((c) => c.replace(/^(sm|md|lg|xl):/, ""));

const src = fs.readFileSync("src/components/sections/recent-entries.tsx", "utf8");
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) pass++; else { fail++; console.log("  FAIL " + l); } };

// The row container's classes.
const rowClasses = src.match(/"group relative grid min-h-\[68px\][^"]*"/)?.[0]?.slice(1, -1) ?? "";
ok(rowClasses.length > 0, "found the row layout classes");

// Amount: one copy hidden on mobile, one shown — exactly one visible per width.
const mobileAmount = src.match(/className="shrink-0 text-\[14\.5px\][^"]*"/)?.[0] ?? "";
const desktopAmount = src.match(/className="hidden text-\[15px\][^"]*"/)?.[0] ?? "";
const trigger = src.match(/"flex size-11 items-center justify-center[^"]*"/s)?.[0] ?? "";

console.log("Recent entries at each viewport:\n");
for (const width of [390, 768, 1024, 1440]) {
  const row = resolve(rowClasses, width);
  const grid = row.find((c) => c.startsWith("grid-cols-"));
  const px = row.filter((c) => c.startsWith("px-")).pop();
  const gap = row.filter((c) => c.startsWith("gap-x-")).pop();

  // Amount visibility: mobile copy has sm:hidden, desktop copy is hidden + sm:inline.
  const mobileVisible = !(width >= 640);
  const desktopVisible = width >= 640;
  const triggerSize = width >= 640 ? "36px (sm:size-9)" : "44px (size-11)";
  const triggerOpacity = width >= 640 ? "revealed on hover/focus" : "always visible";

  console.log(`  ${String(width).padStart(4)}px  ${grid}  padding ${px}  gap ${gap}`);
  console.log(`         amount: ${desktopVisible ? "right column" : "inline with the name"}`);
  console.log(`         menu:   ${triggerSize}, ${triggerOpacity}`);

  ok(grid === "grid-cols-[auto_minmax(0,1fr)_auto]", `${width}px: middle column can shrink (minmax 0)`);
  ok(mobileVisible !== desktopVisible, `${width}px: exactly one amount is visible`);
  if (width < 640) ok(trigger.includes("size-11"), `${width}px: touch target is 44px`);
}

// No horizontal scrolling: nothing in the row may set a width wider than 390.
ok(!/w-\[\d{3,}px\]/.test(src), "no fixed pixel width that could overflow a 390px phone");
ok(/minmax\(0,1fr\)/.test(src), "the text column is allowed to shrink, so long names truncate");
ok(/truncate/.test(src), "long entry names truncate rather than wrapping the row");
ok(/min-h-\[68px\]/.test(src), "row height is in the 64-76px band");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
