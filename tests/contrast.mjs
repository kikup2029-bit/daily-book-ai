import fs from "node:fs";

// --- oklch -> sRGB -------------------------------------------------------
function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h),
    b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v)));
}
const relLum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const contrast = (c1, c2) => {
  const [a, b] = [relLum(c1), relLum(c2)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

// Composite a translucent colour over a backdrop (for border/alpha tokens).
const over = (fg, alpha, bg) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));

// --- read the tokens straight out of the stylesheet ----------------------
const css = fs.readFileSync("src/styles.css", "utf8");
function block(name) {
  const start = css.indexOf(name);
  const open = css.indexOf("{", start);
  let depth = 0,
    i = open;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (!depth) break;
    }
  }
  return css.slice(open, i);
}
function tokens(text) {
  const map = {};
  for (const m of text.matchAll(/--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
    map[m[1]] = oklchToRgb(+m[2], +m[3], +m[4]);
  }
  return map;
}
const dark = tokens(block(":root"));
const light = tokens(block(".light"));
// surfaces are aliased via var(); resolve the ones we need by name
for (const t of [dark, light]) {
  t.card = t["surface-1"];
  t.popover = t["surface-3"];
  t.muted = t["surface-2"];
  t.accent = t.accent ?? t["surface-2"];
  t.secondary = t["surface-2"];
}

let fails = 0,
  checks = 0;
const AA_TEXT = 4.5,
  AA_LARGE = 3.0,
  AA_UI = 3.0;

function check(mode, palette, fg, bg, min, label) {
  const f = palette[fg],
    b = palette[bg];
  if (!f || !b) {
    console.log(`SKIP ${mode} ${fg}/${bg} (unresolved)`);
    return;
  }
  const ratio = contrast(f, b);
  checks++;
  const ok = ratio >= min;
  if (!ok) fails++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${mode.padEnd(5)} ${label.padEnd(34)} ${ratio.toFixed(2)}:1  (need ${min})`,
  );
}

for (const [mode, p] of [
  ["dark", dark],
  ["light", light],
]) {
  console.log(`\n--- ${mode} ---`);
  check(mode, p, "foreground", "background", AA_TEXT, "body text on page");
  check(mode, p, "foreground", "surface-1", AA_TEXT, "body text on panel");
  check(mode, p, "foreground", "surface-2", AA_TEXT, "body text on raised");
  check(mode, p, "muted-foreground", "background", AA_TEXT, "secondary text on page");
  check(mode, p, "muted-foreground", "surface-1", AA_TEXT, "secondary text on panel");
  check(mode, p, "muted-foreground", "surface-2", AA_TEXT, "secondary text on raised");
  check(mode, p, "brand-foreground", "brand", AA_TEXT, "label on brand button");
  check(mode, p, "primary-foreground", "primary", AA_TEXT, "label on primary button");
  check(mode, p, "danger-foreground", "danger", AA_TEXT, "label on danger button");
  check(mode, p, "success", "background", AA_TEXT, "money-in figure on page");
  check(mode, p, "success", "surface-1", AA_TEXT, "money-in figure on panel");
  check(mode, p, "danger", "background", AA_TEXT, "money-out figure on page");
  check(mode, p, "danger", "surface-1", AA_TEXT, "money-out figure on panel");
  check(mode, p, "success", "success-soft", AA_TEXT, "positive badge text");
  check(mode, p, "danger", "danger-soft", AA_TEXT, "negative badge text");
  check(mode, p, "warning", "warning-soft", AA_TEXT, "warning badge text");
  check(mode, p, "foreground", "brand-soft", AA_TEXT, "text on brand tint");
  check(mode, p, "brand", "background", AA_UI, "brand accent vs page (UI)");
  check(mode, p, "ring", "background", AA_UI, "focus ring vs page (UI)");
  check(mode, p, "ring", "surface-1", AA_UI, "focus ring vs panel (UI)");
}

// Hairline borders are alpha-composited in dark mode; check they're visible.
console.log("\n--- non-text contrast of hairlines ---");
for (const [mode, p, alpha, base] of [
  ["dark", dark, 0.09, dark.background],
  ["light", light, null, null],
]) {
  if (alpha === null) {
    const r = contrast(light.border, light["surface-1"]);
    checks++;
    const ok = r >= 1.2;
    if (!ok) fails++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  light border vs panel               ${r.toFixed(2)}:1  (need 1.20 to be seen)`,
    );
  } else {
    const composited = over([1, 1, 1], alpha, base);
    const r = contrast(composited, base);
    checks++;
    const ok = r >= 1.2;
    if (!ok) fails++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  dark border vs page                 ${r.toFixed(2)}:1  (need 1.20 to be seen)`,
    );
  }
}

console.log(`\n${checks - fails}/${checks} pass`);
process.exit(fails === 0 ? 0 : 1);
