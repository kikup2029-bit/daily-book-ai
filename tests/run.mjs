/**
 * Every check that can run without a browser.
 *   node tests/run.mjs
 *
 * Node 22+ strips the TypeScript types itself, so there's no test framework
 * and no build step to keep working.
 */
import { execFileSync } from "node:child_process";

const checks = [
  ["offline queue", ["--experimental-strip-types", "tests/queue.test.ts"]],
  ["entry filters", ["--experimental-strip-types", "tests/filter.test.ts"]],
  ["invoices", ["--experimental-strip-types", "tests/invoices.test.ts"]],
  ["reminders", ["--experimental-strip-types", "tests/reminders.test.ts"]],
  ["entry formatting", ["--experimental-strip-types", "tests/recent-entries.test.ts"]],
  ["translations", ["--experimental-strip-types", "tests/i18n.test.ts"]],
  ["payments", ["--experimental-strip-types", "tests/stripe.test.ts"]],
  ["service worker", ["tests/sw.test.mjs"]],
  ["money signs", ["tests/money.test.mjs"]],
  ["colour contrast", ["tests/contrast.mjs"]],
  ["responsive layout", ["tests/responsive.mjs"]],
  ["recent entries viewports", ["tests/viewports.mjs"]],
  ["top bar (estimate)", ["tests/navbar.mjs"]],
];

let failed = 0;
for (const [name, args] of checks) {
  try {
    const out = execFileSync("node", args, { encoding: "utf8" });
    console.log(`PASS  ${name.padEnd(20)} ${out.trim().split("\n").pop()}`);
  } catch (error) {
    failed++;
    console.log(`FAIL  ${name}`);
    console.log(String(error.stdout ?? error.message));
  }
}
console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) failed.`);
process.exit(failed === 0 ? 0 : 1);
