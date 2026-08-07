# Going live — the checklist

Everything below is written out so nothing has to be remembered. The app is
currently running on Stripe's **sandbox**: real cards do nothing, test cards
work, no money moves.

---

## Where things stand

| | |
|---|---|
| App | https://daily-book-ai.kikup2029.workers.dev |
| Cloudflare Worker name | `daily-book-ai` |
| Stripe mode right now | **Sandbox** |
| Live price id (already created) | `price_1U1r4MEMSZ3AoM69CiBJCtLO` |
| Sandbox price id | `price_1U1Z3hEQK9OJjO7XRE5aQEkZ` |
| Stripe account review | In progress — 2–3 days |

---

## Do these BEFORE going live

**1. Confirm a deploy doesn't wipe the keys.**

Cloudflare was deleting every variable on every deploy. That's supposedly fixed
(`--keep-vars` on the deploy command), but it has never been proven. Push any
small change, wait for the deploy to finish, then press Start Pro. If checkout
still opens, the keys survived. If it errors, this must be fixed before real
customers — otherwise the next code change silently breaks everyone's payments.

**2. Turn on Stripe's trial-ending email.**

Stripe → Settings → Billing → Subscriptions → enable trial ending notifications.
The Terms promise a warning before the first charge. The in-app countdown only
helps someone who opens the app that week; the email reaches everyone.

**3. Make `simplebooksai@gmail.com` a mailbox somebody reads.**

It's printed in the Terms, the Privacy Policy and the footer, and the Terms
promise refunds through it. An unread inbox on that address becomes a chargeback.

**4. Optional but worth it: have a lawyer read /privacy and /terms.**

They're accurate about what the app actually does — which is the part templates
get wrong — but nobody qualified has reviewed them.

---

## The switch itself

Three commands in Terminal. **No code change, no commit, no deploy.**

Open Terminal (Cmd+Space → type `terminal` → Enter) and run them one at a time.
Each asks for a value: paste it and press Enter. Nothing appears on screen while
pasting — that's normal, it's still being read.

```
npx wrangler secret put STRIPE_PRICE_PRO_MONTHLY --name daily-book-ai
```
Paste: `price_1U1r4MEMSZ3AoM69CiBJCtLO`

```
npx wrangler secret put STRIPE_SECRET_KEY --name daily-book-ai
```
Paste the **live** secret key. Stripe → Developers → API keys → Secret key →
Reveal. It starts with `sk_live_`. If it starts with `sk_test_`, you're still in
the sandbox — switch modes first.

```
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name daily-book-ai
```
Paste the signing secret from a **new live webhook** (see below). Starts with
`whsec_`.

### Creating the live webhook

Stripe (live mode) → Developers → Webhooks → Add destination.

- URL: `https://daily-book-ai.kikup2029.workers.dev/api/stripe/webhook`
- Events — these exact five:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

After creating it, reveal the **Signing secret** and use it in the command above.

Without this, a customer can pay and never get Pro. It's the piece that tells
the app the money actually arrived.

---

## All three, or none

The price id, the secret key and the webhook secret must all come from the same
mode. Mixing them fails at Stripe rather than charging the wrong amount, which is
the safe direction — but it does mean nobody can pay until all three match.

## Going back

If anything looks wrong, re-upload the three sandbox values with the same
commands. One minute, no deploy. Nothing is one-way.

---

## After the switch — verify with a real card

Use your own card, then refund yourself.

1. Billing → Start my 7 free days
2. Checkout should say **$0.00 due today** and name a date 7 days out
3. Stripe → Subscriptions shows status **trialing**
4. Stripe → Webhooks → your endpoint → Event deliveries shows a green **200**
5. In the app, open Invoices — it should load instead of showing the paywall
6. Cancel from Billing. Stripe should read **"Cancels [date]"**, and Pro should
   stay on until then

Step 4 is the one that matters. A green 200 means the whole chain works:
Stripe → your app → your database → back to the screen.

---

## Known gaps, honestly

- **119 English strings** remain in a UI that offers six languages. Mostly the
  Tools pages and the Help tab. Someone using Gujarati or Urdu will hit English
  in places.
- **The five translations are machine-drafted.** Each file says so at the top and
  asks for a native speaker before anyone makes financial decisions from it.
- **Pro gating is UI-only on `/entries`.** The search page filters data the free
  dashboard is already entitled to, so there's nothing extra to withhold on the
  server. Every other gate is enforced server-side.
- **`getBudgets` and `getGoals` have no server-side check.** They were Pro before
  the gating pass and got missed. A crafted request could read them.
