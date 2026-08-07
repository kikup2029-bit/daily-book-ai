/**
 * The payment path. These are the tests that matter most in the whole app:
 * everything here is what stands between a public URL and someone granting
 * themselves a paid plan.
 */
import {
  parseSignatureHeader, timingSafeEqual, computeSignature, verifyWebhook,
  grantsPro, needsAttention, readSubscription, isHandled, TOLERANCE_SECONDS,
} from "../src/lib/stripe/webhook.ts";
import {
  PLANS, planHasFeature, formatPrice, withinInvoiceLimit,
  TRIAL_DAYS, firstChargeDate, trialDaysLeft, trialDisclosure,
} from "../src/lib/pricing.ts";
import { en } from "../src/lib/i18n/en.ts";
import { es } from "../src/lib/i18n/es.ts";
import { hi } from "../src/lib/i18n/hi.ts";
import { gu } from "../src/lib/i18n/gu.ts";
import { ur } from "../src/lib/i18n/ur.ts";
import { zh } from "../src/lib/i18n/zh.ts";
import { makeTranslator } from "../src/lib/i18n/translate.ts";

let pass = 0, fail = 0;
const ok = (c: boolean, l: string) => { if (c) pass++; else { fail++; console.log("FAIL: " + l); } };
const eq = (a: unknown, b: unknown, l: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${l} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};

const SECRET = "whsec_test_secret_do_not_use";
const now = 1_760_000_000;
const body = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated", created: now, data: { object: {} } });

async function signedHeader(payload: string, secret = SECRET, t = now) {
  return `t=${t},v1=${await computeSignature(payload, secret, t)}`;
}

// --- header parsing
eq(parseSignatureHeader("t=123,v1=abc"), { timestamp: 123, signatures: ["abc"] }, "parses a header");
eq(parseSignatureHeader("t=123,v1=abc,v1=def")?.signatures, ["abc", "def"],
   "accepts two signatures, which is what a secret rotation looks like");
eq(parseSignatureHeader("v1=abc"), null, "no timestamp is a reject");
eq(parseSignatureHeader("t=123"), null, "no signature is a reject");
eq(parseSignatureHeader(""), null, "empty header is a reject");
eq(parseSignatureHeader("garbage"), null, "garbage is a reject");

// --- constant-time compare
ok(timingSafeEqual("abc", "abc"), "equal strings match");
ok(!timingSafeEqual("abc", "abd"), "different strings don't");
ok(!timingSafeEqual("abc", "abcd"), "different lengths don't");
ok(!timingSafeEqual("", "a"), "empty vs non-empty");

// --- THE CORE: a forged webhook must never be accepted
{
  const good = await signedHeader(body);
  const verified = await verifyWebhook(body, good, SECRET, now);
  ok(verified.ok, "a correctly signed event is accepted");

  const wrongSecret = await verifyWebhook(body, await signedHeader(body, "whsec_attacker"), SECRET, now);
  ok(!wrongSecret.ok, "an event signed with the wrong secret is REJECTED");

  const noSignature = await verifyWebhook(body, "", SECRET, now);
  ok(!noSignature.ok, "an unsigned event is REJECTED");

  // The attack that matters: take a real signed event and change the payload.
  const tampered = body.replace('"evt_1"', '"evt_forged"');
  const tamperedResult = await verifyWebhook(tampered, good, SECRET, now);
  ok(!tamperedResult.ok, "a tampered payload with a real signature is REJECTED");

  // Re-serialising the JSON changes whitespace and therefore the hash.
  const reserialised = JSON.stringify(JSON.parse(body), null, 2);
  const reserialisedResult = await verifyWebhook(reserialised, good, SECRET, now);
  ok(!reserialisedResult.ok, "verification is over raw bytes, not parsed JSON");

  const noSecret = await verifyWebhook(body, good, "", now);
  ok(!noSecret.ok, "with no secret configured, nothing is accepted");
}

// --- replay protection
{
  const old = await signedHeader(body, SECRET, now - TOLERANCE_SECONDS - 60);
  const result = await verifyWebhook(body, old, SECRET, now);
  ok(!result.ok, "an event older than the tolerance is REJECTED as a replay");

  const justInside = await signedHeader(body, SECRET, now - TOLERANCE_SECONDS + 10);
  ok((await verifyWebhook(body, justInside, SECRET, now)).ok, "just inside the window is fine");

  const future = await signedHeader(body, SECRET, now + TOLERANCE_SECONDS + 60);
  ok(!(await verifyWebhook(body, future, SECRET, now)).ok,
     "a far-future timestamp is rejected too, not just an old one");
}

// --- malformed body
{
  const notJson = "this is not json";
  const header = await signedHeader(notJson);
  ok(!(await verifyWebhook(notJson, header, SECRET, now)).ok,
     "a correctly signed non-JSON body is still rejected");
}

// --- which events we act on
ok(isHandled("checkout.session.completed"), "handles checkout completion");
ok(isHandled("customer.subscription.created"), "handles subscription created");
ok(isHandled("customer.subscription.updated"), "handles subscription updated");
ok(isHandled("customer.subscription.deleted"), "handles subscription deleted");
ok(isHandled("invoice.payment_failed"), "handles payment failure");
ok(!isHandled("customer.created"), "ignores events we don't act on");

// --- who gets Pro
ok(grantsPro("active"), "active grants Pro");
ok(grantsPro("trialing"), "trialing grants Pro");
ok(grantsPro("past_due"),
   "past_due KEEPS access — Stripe retries for days, and a failed card is usually an expired card, not a decision to leave");
ok(!grantsPro("canceled"), "canceled does not grant Pro");
ok(!grantsPro("unpaid"), "unpaid does not grant Pro");
ok(!grantsPro("incomplete"), "an abandoned checkout does not grant Pro");
ok(!grantsPro(null), "no subscription does not grant Pro");
ok(!grantsPro(undefined), "undefined does not grant Pro");
ok(!grantsPro(""), "empty status does not grant Pro");
ok(!grantsPro("ACTIVE"), "status matching is exact — a lookalike doesn't slip through");

ok(needsAttention("past_due"), "past_due asks the customer to fix their card");
ok(!needsAttention("active"), "a healthy subscription doesn't nag");

// --- reading a subscription object
{
  const parsed = readSubscription({
    id: "sub_1", customer: "cus_1", status: "active",
    current_period_end: 1_770_000_000, cancel_at_period_end: false,
    items: { data: [{ price: { id: "price_1" } }] },
  });
  eq(parsed?.subscriptionId, "sub_1", "reads the subscription id");
  eq(parsed?.customerId, "cus_1", "reads the customer id");
  eq(parsed?.priceId, "price_1", "reads the price id");
  ok(parsed?.currentPeriodEnd?.startsWith("2026-") || parsed?.currentPeriodEnd?.startsWith("2025-"),
     "converts the period end to an ISO date");

  // Stripe sends `customer` expanded sometimes.
  eq(readSubscription({ id: "sub_2", customer: { id: "cus_2" }, status: "active" })?.customerId,
     "cus_2", "handles an expanded customer object");

  eq(readSubscription({ status: "active" }), null, "an object with no id is unusable, not guessed at");
  eq(readSubscription({ id: "sub_3" }), null, "an object with no customer is unusable");
  eq(readSubscription({ id: "s", customer: "c" })?.status, "incomplete",
     "a missing status defaults to the safe end, not to active");
}

// --- the renewal date moved between API versions
// Up to 2025-03-31 `current_period_end` sat on the subscription; after that it
// sits on each subscription item. The webhook endpoint's pinned version decides
// which shape arrives, and that's a dashboard setting nobody would think to
// check. Both must work, or the renewal date silently becomes null.
{
  const older = readSubscription({
    id: "sub_old", customer: "cus_1", status: "active",
    current_period_end: 1_770_000_000,
    items: { data: [{ price: { id: "price_1" } }] },
  });
  eq(older?.currentPeriodEnd, new Date(1_770_000_000_000).toISOString(),
     "reads the period end from the subscription (API <= 2025-03-31)");

  const newer = readSubscription({
    id: "sub_new", customer: "cus_1", status: "active",
    items: { data: [{ price: { id: "price_1" }, current_period_end: 1_770_000_000 }] },
  });
  eq(newer?.currentPeriodEnd, new Date(1_770_000_000_000).toISOString(),
     "reads the period end from the item (API >= 2025-04-30)");

  // If both are present the item wins, since that's the newer authority.
  const both = readSubscription({
    id: "sub_both", customer: "cus_1", status: "active",
    current_period_end: 1_700_000_000,
    items: { data: [{ price: { id: "price_1" }, current_period_end: 1_770_000_000 }] },
  });
  eq(both?.currentPeriodEnd, new Date(1_770_000_000_000).toISOString(),
     "the item's period end wins over the subscription's");

  const neither = readSubscription({ id: "sub_none", customer: "cus_1", status: "active" });
  eq(neither?.currentPeriodEnd, null, "no period end anywhere stays null rather than becoming a date");
}

// --- pricing config is the single source of truth
eq(PLANS.pro.priceCents, 999, "Pro price lives in one place");
eq(formatPrice(999), "$9.99", "formats the price");
eq(formatPrice(0), "Free", "free reads as Free, not $0.00");
ok(planHasFeature("pro", "aiQuestions"), "Pro includes AI questions");
ok(!planHasFeature("free", "aiQuestions"), "Free does not");
ok(!planHasFeature("free", "receiptScanning"), "Free does not include receipt scanning");
/*
 * The free tier is thin by design, but exactly two things must survive in it,
 * and both are promises made in the Terms rather than product decisions to be
 * revisited when conversion looks flat:
 *
 *   exports      — someone who stops paying can still take their own books
 *                  with them. Removing this makes the app a hostage-taker.
 *   allLanguages — the audience is people whose first language isn't English.
 *                  Charging for Gujarati doesn't slim the free tier down, it
 *                  makes it unreadable for the people it exists for.
 *
 * If a future edit drops either, this test should fail loudly.
 */
eq(PLANS.free.features.slice().sort(), ["allLanguages", "exports"],
   "free keeps exports and every language, and nothing else");
ok(planHasFeature("free", "exports"), "a lapsed customer can still get their data out");
ok(planHasFeature("free", "allLanguages"), "free is readable in every supported language");
ok(!planHasFeature("free", "unlimitedInvoices"), "invoicing is Pro");
ok(!planHasFeature("free", "householdSharing"), "sharing is Pro");
ok(!planHasFeature("free", "budgetsAndGoals"), "budgets and goals are Pro");

ok(PLANS.pro.stripePriceEnvVar !== null, "Pro maps to a Stripe price via an env var");
ok(PLANS.free.stripePriceEnvVar === null, "Free has no Stripe price — it can't be bought");
ok(!withinInvoiceLimit("free", 0), "free makes no invoices at all — the cap is zero");
ok(withinInvoiceLimit("pro", 9999), "Pro has no invoice cap");

// --- the trial
{
  eq(TRIAL_DAYS, 7, "the trial length lives in one place");

  const start = new Date("2026-03-01T10:00:00Z");
  eq(firstChargeDate(start).toISOString().slice(0, 10), "2026-03-08",
     "the first charge lands seven days after the trial starts");

  // Counting days left, from both sides of each boundary.
  const end = "2026-03-08T10:00:00Z";
  eq(trialDaysLeft(end, new Date("2026-03-01T10:00:00Z")), 7, "seven days at the start");
  eq(trialDaysLeft(end, new Date("2026-03-07T10:00:00Z")), 1, "one day left on the last day");
  eq(trialDaysLeft(end, new Date("2026-03-08T09:59:00Z")), 1, "still 1 with an hour to go, never 0 early");
  eq(trialDaysLeft(end, new Date("2026-03-08T10:00:00Z")), 0, "0 exactly when it expires");
  eq(trialDaysLeft(end, new Date("2026-03-20T10:00:00Z")), 0, "never negative once it's past");
  eq(trialDaysLeft(null), null, "no trial means no countdown");
  eq(trialDaysLeft("not a date"), null, "an unparseable date doesn't become a fake countdown");

  /*
   * The disclosure is the sentence that makes a card-up-front trial lawful in
   * the US. It has to carry all three facts before a card is entered: the
   * amount, the date of the first charge, and how to avoid being charged.
   * Asserting on its content rather than trusting it to stay written.
   */
  const disclosure = trialDisclosure("en-US", start);
  ok(disclosure.includes("$9.99"), "the disclosure names the amount");
  ok(disclosure.includes("8 March") || disclosure.includes("March 8"),
     "the disclosure names the date of the first charge");
  ok(/cancel/i.test(disclosure), "the disclosure says how to avoid the charge");
  ok(/pay nothing|no charge|free/i.test(disclosure),
     "the disclosure says cancelling costs nothing");
}

/*
 * --- the post-signup trial offer (/welcome)
 *
 * This screen is the only place the trial is sold, and it takes a card. Two
 * things about it are a contract rather than copy, so they are asserted here
 * instead of trusted to survive the next redesign:
 *
 *   The fine print names the trial length AND the price. A "free trial" pitch
 *   that doesn't say what happens when the free part ends is the exact pattern
 *   the FTC's negative-option rules exist to stop.
 *
 *   The way out is present in every language. If billing.welcomeContinueFree
 *   ever goes missing from a translation, a reader of that language is left on
 *   a screen whose only visible answer is "give us your card". The free path
 *   disappearing quietly in a locale nobody on the team reads is precisely how
 *   that happens by accident.
 */
{
  const billing = en.billing as Record<string, string | undefined>;

  ok(typeof billing.welcomeTitle === "string", "the welcome screen has a heading");
  ok(typeof billing.welcomeBody_other === "string", "the welcome screen says what Pro includes");
  ok(typeof billing.welcomeFinePrint_other === "string", "the welcome screen has fine print");
  ok(typeof billing.welcomeStartTrial === "string", "the welcome screen has a start-trial button");
  ok(typeof billing.welcomeContinueFree === "string", "the welcome screen has a stay-on-Free button");

  // Rendered the way the screen renders it, so a placeholder that stopped
  // being substituted would fail here rather than ship as literal "{price}".
  const t = makeTranslator(en, en, "en", "en-US");
  const finePrint = t("billing.welcomeFinePrint", {
    count: TRIAL_DAYS,
    price: formatPrice(PLANS.pro.priceCents),
  });
  ok(finePrint.includes(String(TRIAL_DAYS)), "the fine print names the length of the trial");
  ok(finePrint.includes(formatPrice(PLANS.pro.priceCents)),
     "the fine print names the price that gets charged afterwards");
  ok(!/\{\w+\}/.test(finePrint), "every placeholder in the fine print is actually filled in");
  ok(/cancel/i.test(finePrint), "the fine print says the subscription can be cancelled");

  const trialCta = t("billing.welcomeStartTrial", { count: TRIAL_DAYS });
  ok(trialCta.includes(String(TRIAL_DAYS)) && !/\{\w+\}/.test(trialCta),
     "the trial button reads the length from the config rather than hard-coding it");

  // Neither number may be typed into the copy: they belong to pricing.ts, and
  // a literal here would go stale the day the price or the trial length moves.
  for (const key of ["welcomeTitle", "welcomeBody_one", "welcomeBody_other",
                     "welcomeFinePrint_one", "welcomeFinePrint_other", "welcomeStartTrial"]) {
    const value = billing[key] ?? "";
    ok(!value.includes("9.99"), `${key} takes the price from the config, not from a literal`);
    ok(!new RegExp(`\\b${TRIAL_DAYS}\\b`).test(value),
       `${key} takes the trial length from the config, not from a literal`);
  }

  for (const [name, dict] of [["es", es], ["hi", hi], ["gu", gu], ["ur", ur], ["zh", zh]] as const) {
    const section = (dict.billing ?? {}) as Record<string, string | undefined>;
    ok(typeof section.welcomeContinueFree === "string" && section.welcomeContinueFree.length > 0,
       `${name} keeps the "continue with Free" way out of the trial offer`);
    ok(typeof section.welcomeFinePrint_other === "string" &&
       section.welcomeFinePrint_other.includes("{price}") &&
       section.welcomeFinePrint_other.includes("{count}"),
       `${name} keeps both the price and the trial length in the fine print`);
  }
}

/**
 * Comments explain what the code deliberately does NOT do, so they have to be
 * stripped before grepping for forbidden patterns — otherwise a comment saying
 * "never accepts an amount" reads as an amount being accepted.
 */
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

// --- the price charged is never taken from the client
{
  const source = codeOnly(await import("node:fs").then((fs) =>
    fs.readFileSync("src/lib/subscriptions.functions.ts", "utf8")));
  ok(!/amount|priceCents|unit_amount/.test(source),
     "checkout never accepts an amount from the browser");
  ok(/z\.literal\("pro"\)/.test(source),
     "the only thing the browser may name is the plan id");
  ok(/requireSupabaseAuth/.test(source),
     "every billing function is behind authentication");
}

// --- the secret must not be inlined into the bundle
{
  const fs = await import("node:fs");
  const vite = codeOnly(fs.readFileSync("vite.config.ts", "utf8"));
  ok(!/STRIPE_SECRET_KEY/.test(vite),
     "the Stripe secret key is NOT in the build-time inlining list");
  ok(!/STRIPE_WEBHOOK_SECRET/.test(vite),
     "the webhook signing secret is NOT in the build-time inlining list");

  const client = codeOnly(fs.readFileSync("src/lib/stripe/client.server.ts", "utf8"));
  ok(!/readServerEnv/.test(client),
     "Stripe credentials never go through the helper that falls back to build-time values");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
