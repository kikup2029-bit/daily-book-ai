/**
 * Billing: what you pay, and how to change it.
 *
 * Nothing on these screens decides anything. Whether someone is on Pro is
 * settled on the server by a verified Stripe webhook, and this file only
 * reports the answer. That matters most on the success page, which is reached
 * by a redirect the customer's own browser performed — a redirect is a hint
 * that checkout finished, never proof that money moved. So it waits for the
 * server to say so, and says so honestly if it hasn't yet.
 *
 * The dictionary has no billing section yet, so the strings here are written in
 * English rather than through t(). They are all plain sentences ready to be
 * lifted into en.ts and translated in one pass — see the handover note.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, CreditCard, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Alert,
  Badge,
  Metric,
  PageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
} from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import { PLANS, PLAN_LIST, formatPrice, type Plan } from "@/lib/pricing";
import { getSubscription, openBillingPortal, startCheckout } from "@/lib/subscriptions.functions";
import { useSubscription } from "@/lib/use-subscription";

/** Stripe's status words, said the way a shopkeeper would say them. */
const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment overdue",
  canceled: "Cancelled",
  incomplete: "Not finished",
  incomplete_expired: "Expired",
  unpaid: "Unpaid",
  paused: "Paused",
};

function statusTone(status: string | null): "neutral" | "positive" | "warning" | "negative" {
  if (status === "active" || status === "trialing") return "positive";
  if (status === "past_due" || status === "incomplete") return "warning";
  if (status === "unpaid" || status === "canceled" || status === "incomplete_expired") {
    return "negative";
  }
  return "neutral";
}

/**
 * currentPeriodEnd arrives as a full ISO timestamp from Stripe, and formatDate
 * expects a plain calendar date. Taking the date part keeps the renewal day
 * readable instead of printing the raw string back at people.
 */
const dayOf = (iso: string) => iso.slice(0, 10);

/** The message the server sent, or something true if it sent nothing useful. */
function reason(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : "";
  return message || "Something went wrong on our end. Nothing was charged.";
}

/* ============================================================= home ====== */

export function BillingHome() {
  const { formatDate, tag } = useI18n();
  const { data: subscription, isLoading, error } = useSubscription();

  const checkout = useServerFn(startCheckout);
  const portal = useServerFn(openBillingPortal);

  const startPro = useMutation({
    mutationFn: () => checkout({ data: { plan: "pro" as const, origin: window.location.origin } }),
    // Stripe hosts the payment page; leaving the app is the point.
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });

  const manage = useMutation({
    mutationFn: () => portal({ data: { origin: window.location.origin } }),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
  });

  const pro = subscription?.isPro === true;
  const renews = subscription?.currentPeriodEnd ? dayOf(subscription.currentPeriodEnd) : null;

  return (
    <div className="rise mx-auto w-full max-w-4xl">
      <PageHeader
        eyebrow="Billing"
        title="Your plan"
        description="What you are paying for, and everything you can change about it."
      />

      {error ? (
        <div className="pb-6">
          <Alert tone="negative" title="Your plan couldn't be loaded">
            {reason(error)}
          </Alert>
        </div>
      ) : null}

      {isLoading ? (
        <Panel>
          <PanelBody className="pt-5">
            <span className="skeleton block h-4 w-24" aria-hidden="true" />
            <span className="skeleton mt-3 block h-8 w-40" aria-hidden="true" />
            <span className="skeleton mt-3 block h-3.5 w-full max-w-sm" aria-hidden="true" />
            <p className="sr-only">Loading your plan.</p>
          </PanelBody>
        </Panel>
      ) : null}

      {!isLoading && subscription?.needsAttention ? (
        <div className="pb-6">
          <Alert tone="warning" title="A payment didn't go through">
            <p>
              Your last payment was declined. Nothing has been switched off — Stripe will keep
              trying for a few days, and everything you pay for carries on working while it does.
            </p>
            <p className="mt-2">
              Updating the card usually fixes it, and the charge goes through on the next attempt.
            </p>
            <Button
              variant="brand"
              size="sm"
              className="mt-3"
              loading={manage.isPending}
              onClick={() => manage.mutate()}
            >
              <CreditCard aria-hidden="true" /> Update your card
            </Button>
          </Alert>
        </div>
      ) : null}

      {manage.isError ? (
        <div className="pb-6">
          <Alert tone="negative" title="Billing couldn't be opened">
            {reason(manage.error)}
          </Alert>
        </div>
      ) : null}

      {startPro.isError ? (
        <div className="pb-6">
          <Alert tone="negative" title="Checkout couldn't be started">
            {reason(startPro.error)}
          </Alert>
        </div>
      ) : null}

      {!isLoading && subscription && pro ? (
        <ProPanel
          status={subscription.status}
          renews={renews}
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          locale={tag}
          formatDate={formatDate}
          onManage={() => manage.mutate()}
          managing={manage.isPending}
        />
      ) : null}

      {!isLoading && subscription && !pro ? (
        <section aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="sr-only">
            Compare the plans
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLAN_LIST.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                locale={tag}
                current={plan.id === subscription.plan}
                onStart={plan.id === "pro" ? () => startPro.mutate() : undefined}
                starting={startPro.isPending}
              />
            ))}
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            Payment is handled by Stripe on their own page — card details never reach SimpleBooks.
            You can cancel from here at any time, and keep Pro until the month you have paid for
            runs out.
          </p>
        </section>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- pro summary -- */

function ProPanel({
  status,
  renews,
  cancelAtPeriodEnd,
  locale,
  formatDate,
  onManage,
  managing,
}: {
  status: string | null;
  renews: string | null;
  cancelAtPeriodEnd: boolean;
  locale: string;
  formatDate: (iso: string, style?: "short" | "long") => string;
  onManage: () => void;
  managing: boolean;
}) {
  const label = status ? (STATUS_LABEL[status] ?? status) : "Active";

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="SimpleBooks Pro"
          description="Everything in the app is unlocked on this account."
          action={<Badge tone={statusTone(status)}>{label}</Badge>}
        />
        <PanelBody className="grid gap-6 pt-1 sm:grid-cols-2">
          <Metric
            label="Your plan"
            value={PLANS.pro.name}
            emphasis="compact"
            hint={`${formatPrice(PLANS.pro.priceCents, locale)} ${PLANS.pro.cadence}`}
          />
          <Metric
            label={cancelAtPeriodEnd ? "Pro ends" : "Renews"}
            value={renews ? formatDate(renews, "long") : "—"}
            emphasis="compact"
            hint={
              renews
                ? cancelAtPeriodEnd
                  ? "The last day of the month you've paid for."
                  : "You'll be charged again on this date."
                : "No renewal date has come back from Stripe yet."
            }
          />
        </PanelBody>
        <PanelFooter>
          <Button variant="brand" loading={managing} onClick={onManage}>
            <CreditCard aria-hidden="true" /> Manage billing
          </Button>
          <span className="text-[12px] text-muted-foreground">
            Change your card, see receipts, or cancel.
          </span>
        </PanelFooter>
      </Panel>

      {cancelAtPeriodEnd ? (
        <Alert tone="neutral" title="Pro is set to end">
          {renews ? (
            <p>
              Pro stays on until {formatDate(renews, "long")}. After that this account goes back to
              the Free plan and you won't be charged again. Nothing you've recorded is deleted.
            </p>
          ) : (
            <p>
              Pro stays on until the end of the month you've paid for. After that this account goes
              back to the Free plan and you won't be charged again. Nothing you've recorded is
              deleted.
            </p>
          )}
          <p className="mt-2">Changed your mind? Manage billing to start it up again.</p>
        </Alert>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ plan card -- */

function PlanCard({
  plan,
  locale,
  current,
  onStart,
  starting,
}: {
  plan: Plan;
  locale: string;
  current: boolean;
  onStart?: () => void;
  starting: boolean;
}) {
  return (
    <Panel className={plan.featured ? "border-brand-border" : undefined}>
      <PanelHeader
        title={plan.name}
        description={plan.tagline}
        action={
          current ? (
            <Badge>Your plan</Badge>
          ) : plan.featured ? (
            <Badge tone="brand">
              <Sparkles className="size-3" aria-hidden="true" /> Everything
            </Badge>
          ) : null
        }
      />
      <PanelBody className="pt-1">
        <p className="figure text-[28px]">{formatPrice(plan.priceCents, locale)}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{plan.cadence}</p>

        <ul className="mt-4 space-y-2">
          {plan.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-[13px]">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span className="min-w-0">{bullet}</span>
            </li>
          ))}
        </ul>
      </PanelBody>
      <PanelFooter>
        {onStart ? (
          <Button variant="brand" loading={starting} onClick={onStart}>
            {starting ? "Opening Stripe…" : plan.cta}
          </Button>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            {current ? "This is what you're on today." : plan.cta}
          </span>
        )}
      </PanelFooter>
    </Panel>
  );
}

/* ========================================================== success ====== */

/** How often to ask the server whether the webhook has landed. */
const POLL_MS = 2000;
/** How long to keep asking before saying plainly that it hasn't arrived. */
const WAIT_MS = 20_000;

/**
 * The page Stripe sends people back to.
 *
 * The redirect is NOT proof of payment: the browser performed it, and a browser
 * can be pointed at any URL by anyone. Pro is granted by the signed webhook
 * Stripe sends to the server, which may not have arrived yet — so this waits
 * for the server's own answer, and never claims success on its own.
 */
export function BillingSuccess({ sessionId }: { sessionId?: string }) {
  const fetchSubscription = useServerFn(getSubscription);
  const [waitedLongEnough, setWaitedLongEnough] = useState(false);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => fetchSubscription(),
    // Keep asking until the server says Pro, or until the wait is up.
    refetchInterval: (query) => (waitedLongEnough || query.state.data?.isPro ? false : POLL_MS),
    // The poll is the retry. Backing off on top of it only muddles the timing.
    retry: false,
  });

  const confirmed = data?.isPro === true;

  useEffect(() => {
    if (confirmed) return;
    const timer = window.setTimeout(() => setWaitedLongEnough(true), WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [confirmed]);

  return (
    <BillingNotice>
      {confirmed ? (
        <Panel>
          <PanelBody className="pt-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-[22px] leading-tight">You're on Pro</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              The payment came through and everything is unlocked on this account. A receipt is on
              its way to your email from Stripe.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild variant="brand">
                <Link to="/dashboard">
                  Go to your books <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/billing">See your plan</Link>
              </Button>
            </div>
          </PanelBody>
        </Panel>
      ) : waitedLongEnough ? (
        <Panel>
          <PanelBody className="pt-6">
            <h1 className="text-[22px] leading-tight">This is still being confirmed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment may still be going through. Confirmation usually takes seconds but can
              take a minute or two, and it will finish whether or not this page is open.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing is lost either way: if the payment succeeded, Pro switches on by itself. Your
              billing page always shows where things actually stand.
            </p>
            {error ? (
              <div className="mt-4">
                <Alert tone="neutral" title="The last check didn't get an answer">
                  {reason(error)}
                </Alert>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="brand" loading={isFetching} onClick={() => void refetch()}>
                Check again
              </Button>
              <Button asChild variant="outline">
                <Link to="/billing">Go to billing</Link>
              </Button>
            </div>
            <p className="mt-5 border-t pt-4 text-[13px] text-muted-foreground">
              If Pro still isn't showing in a few minutes, contact support and quote the reference
              below.
            </p>
            {sessionId ? (
              <p className="num mt-1.5 break-all text-[12px] text-muted-foreground">
                Reference: {sessionId}
              </p>
            ) : null}
          </PanelBody>
        </Panel>
      ) : (
        <Panel>
          <PanelBody className="pt-6">
            <div aria-live="polite">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span className="eyebrow">Confirming</span>
              </span>
              <h1 className="mt-3 text-[22px] leading-tight">Confirming your payment</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                You're back from Stripe. We wait for Stripe itself to confirm the payment before
                switching this account to Pro, rather than taking the trip back here as proof — it
                normally takes a few seconds.
              </p>
            </div>
            <p className="mt-4 text-[13px] text-muted-foreground">
              You can leave this page. Nothing depends on it staying open.
            </p>
          </PanelBody>
        </Panel>
      )}
    </BillingNotice>
  );
}

/* ======================================================== cancelled ====== */

export function BillingCancelled() {
  return (
    <BillingNotice>
      <Panel>
        <PanelBody className="pt-6">
          <h1 className="text-[22px] leading-tight">Checkout closed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You didn't pay anything and nothing has changed. Your books are exactly where you left
            them, and the Free plan carries on as before.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pro is there whenever you want it — there's no rush and no penalty for closing the page.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/billing">Look at the plans again</Link>
            </Button>
            <Button asChild variant="brand">
              <Link to="/dashboard">
                Back to your books <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </PanelBody>
      </Panel>
    </BillingNotice>
  );
}

/* ----------------------------------------------------------- the shell -- */

/**
 * These two pages sit outside the app's nav on purpose: they're a stop on the
 * way back from Stripe, not a place to work. One narrow column, centred, and
 * comfortable at 360px.
 */
function BillingNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6">
      <main className="rise w-full max-w-lg">{children}</main>
    </div>
  );
}
