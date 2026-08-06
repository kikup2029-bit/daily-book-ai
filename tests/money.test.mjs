// The + and - signs must survive any future visual refinement, so assert the
// contract in the source itself rather than trusting a code review.
import fs from "node:fs";
let pass = 0,
  fail = 0;
const ok = (c, l) => {
  if (c) pass++;
  else {
    fail++;
    console.log("FAIL: " + l);
  }
};

const kit = fs.readFileSync("src/components/ui/kit.tsx", "utf8");
ok(
  /\$\{value >= 0 \? "\+" : "−"\}/.test(kit),
  "Money still prefixes + for positive and − for negative",
);
ok(/signed\s*\?/.test(kit), "the signed branch is still there");

// The minus must be U+2212, not a hyphen: it aligns with digits in tabular
// figures and reads correctly in a screen reader.
const minus = kit.match(/: "(.)"\}\$\{formatMoney/);
ok(kit.includes("−"), "uses a real minus sign (U+2212), not a hyphen");

// Print CSS must not hide or recolour amounts into invisibility.
const css = fs.readFileSync("src/styles.css", "utf8");
const printBlock = css.slice(
  css.indexOf("@media print"),
  css.indexOf("@media (prefers-reduced-motion"),
);
ok(!/\.num[^{]*\{[^}]*display:\s*none/.test(printBlock), "print CSS never hides .num amounts");
ok(
  /\.num,\s*\n\s*\.figure\s*\{\s*color: #000/.test(printBlock.replace(/\r/g, "")),
  "print forces amounts to solid black",
);
ok(
  !/\.invoice-print[^{]*\{[^}]*display:\s*none/.test(printBlock),
  "the invoice itself is never hidden when printing",
);

// Greyscale safety: the sign carries direction, so no component may rely on
// colour alone. Spot-check that signed money is used where values can be negative.
const today = fs.readFileSync("src/components/sections/today-sections.tsx", "utf8");
ok(/<Money[^>]*signed/.test(today), "the dashboard's net figure is signed");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
