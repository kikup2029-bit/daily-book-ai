/**
 * Static responsive audit. Looks at surrounding lines, because the wrapper
 * that fixes an overflow is almost never on the same line as the thing that
 * would overflow.
 */
import fs from "node:fs";
import path from "node:path";

const files = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") && !p.includes("src/components/ui/sidebar.tsx")) files.push(p);
  }
})("src");

let issues = 0;
const flag = (file, line, msg) => {
  issues++;
  console.log(`  FAIL ${file}:${line}  ${msg}`);
};
const before = (lines, i, n = 4) => lines.slice(Math.max(0, i - n), i + 1).join(" ");

console.log("--- wide elements without a scrolling ancestor ---");
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    for (const m of text.matchAll(/\bmin-w-\[(\d+(?:\.\d+)?)(px|rem)\]/g)) {
      const px = m[2] === "rem" ? +m[1] * 16 : +m[1];
      if (px <= 360) continue;
      if (!/overflow-(x-)?(auto|scroll)/.test(before(lines, i))) {
        flag(file, i + 1, `${m[0]} with no scrolling ancestor within 4 lines`);
      }
    }
    for (const m of text.matchAll(/\bw-\[(\d+)px\]/g)) {
      if (+m[1] > 340 && !/max-w|sm:|md:|lg:/.test(text)) {
        flag(file, i + 1, `fixed ${m[0]} can't shrink below 360px`);
      }
    }
  });
}

console.log("--- tables that can't be scrolled or stacked ---");
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    if (!/<table/.test(text)) return;
    const ctx = before(lines, i, 6) + " " + text;
    const stacksOnMobile = /\bhidden\b/.test(text) && /\bsm:table\b/.test(text);
    if (!stacksOnMobile && !/overflow-(x-)?(auto|scroll)|sm:hidden/.test(ctx)) {
      flag(file, i + 1, "<table> with no scroll wrapper and no mobile alternative");
    }
  });
}

console.log("--- charts whose container has no resolvable height ---");
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    if (!/ResponsiveContainer/.test(text)) return;
    if (!/height="100%"/.test(text)) return;
    // Recharts collapses to zero unless an ancestor sets a real height.
    const ctx = before(lines, i, 3);
    const hasHeight = /\bh-\d+\b|\bh-\[[^\]]+\]|aspect-\[|\bh-full\b/.test(ctx);
    if (!hasHeight) flag(file, i + 1, 'height="100%" with no sized ancestor — chart will collapse');
  });
}

console.log("--- tablet band 768-1024: layouts stuck at one column ---");
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    const lg = text.match(/\blg:grid-cols-(\d+)/);
    if (!lg || +lg[1] < 3) return;
    // Fine if there's a base or sm/md step giving tablets more than one column.
    const stepped = /\bgrid-cols-[2-9]\b/.test(text) || /\b(sm|md):grid-cols-[2-9]/.test(text);
    if (!stepped) flag(file, i + 1, `lg:grid-cols-${lg[1]} but tablets get a single column`);
  });
}

console.log("--- flex/grid children that will overflow instead of truncating ---");
for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((text, i) => {
    if (!/\btruncate\b/.test(text)) return;
    const ctx = before(lines, i, 3) + " " + text;
    // truncate needs min-w-0 (or a width) once it's a flex/grid child.
    const inFlexOrGrid = /\bflex\b|\bgrid\b/.test(before(lines, i, 3));
    if (inFlexOrGrid && !/min-w-0|w-\[|w-\d|max-w-/.test(ctx)) {
      flag(file, i + 1, "truncate inside flex/grid without min-w-0 — text will push the row wide");
    }
  });
}

console.log(`\n${issues} issue(s) after context checks`);
process.exit(issues === 0 ? 0 : 1);
