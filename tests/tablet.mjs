/**
 * The 768-1024 band specifically. Tailwind: sm=640, md=768, lg=1024 — so this
 * band is "sm and md apply, lg does not". Layouts that only step up at lg get
 * the phone layout on a tablet.
 */
import fs from "node:fs";

const targets = [
  "src/components/sections/today-sections.tsx",
  "src/components/sections/month-sections.tsx",
  "src/components/sections/month-cards.tsx",
  "src/components/sections/invoices-sections.tsx",
  "src/components/sections/tools-sections.tsx",
  "src/components/sections/entries-search.tsx",
  "src/components/app-topnav.tsx",
];

// What a grid resolves to at a given width.
function colsAt(cls, width) {
  const pick = (prefix) => {
    const m = cls.match(new RegExp(`\\b${prefix}grid-cols-(\\d+)`));
    return m ? +m[1] : null;
  };
  let cols = pick("") ?? 1;
  if (width >= 640) cols = pick("sm:") ?? cols;
  if (width >= 768) cols = pick("md:") ?? cols;
  if (width >= 1024) cols = pick("lg:") ?? cols;
  return cols;
}

console.log("Grid behaviour across the band (360 phone / 800 tablet / 1280 desktop)\n");
let suspicious = 0;
for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    if (!/grid-cols-/.test(text)) return;
    const cls = text.match(/className="([^"]*)"/)?.[1] ?? text;
    const [phone, tablet, desktop] = [360, 800, 1280].map((w) => colsAt(cls, w));
    // The thing to catch: a tablet stuck on the phone layout while desktop
    // gets a much richer one.
    const stuck = tablet === phone && desktop > tablet + 1;
    if (stuck) suspicious++;
    console.log(
      `  ${stuck ? "CHECK" : "  ok "} ${file.split("/").pop()}:${String(i + 1).padStart(4)}  ${phone} → ${tablet} → ${desktop} cols`,
    );
  });
}

console.log("\nShell widths at 800px:");
const nav = fs.readFileSync("src/components/app-topnav.tsx", "utf8");
console.log(
  `  desktop nav visible at >=768? ${/hidden items-center gap-1 md:flex/.test(nav) ? "yes (md:flex)" : "CHECK"}`,
);
console.log(`  hamburger hidden at >=768?   ${/md:hidden/.test(nav) ? "yes" : "CHECK"}`);
const mainMatch = nav.match(/<main className="([^"]+)"/);
console.log(`  main container: ${mainMatch ? mainMatch[1] : "not found"}`);
console.log("  max-w-6xl = 1152px, so at 800px the page is fluid with 24px gutters");

console.log(`\n${suspicious} grid(s) worth eyeballing on a tablet`);
