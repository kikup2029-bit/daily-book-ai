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
 * Every sentence on these screens comes from the `billing` section of the
 * dictionary. Nothing here joins fragments together: a price and its cadence,
 * or a date and the charge that lands on it, are one key each, because where
 * the number falls against the words differs per language.
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
const STATUS_KEY: Record<string, string> = {
  active: "billing.statusActive",
  trialing: "billing.statusTrialing",
  past_due: "billing.statusPastDue",
  canceled: "billing.statusCanceled",
  incomplete: "billing.statusIncomplete",
  incomplete_expired: "billing.statusExpired",
  unpaid: "billing.statusUnpaid",
  paused: "billing.statusPaused",
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

/**
 * The message the server sent, or something true if it sent nothing useful.
 *
 * The fallback is passed in already translated: a server message arrives in
 * whatever language the server speaks, but our own apology should be in the
 * reader's.
 */
function reason(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message.trim() : "";
  return message || fallback;
}

/* ============================================================= home ====== */

export function BillingHome() {
  const { formatDate, t, tag } = useI18n();
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
        eyebrow={t("billing.eyebrow")}
        title={t("billing.title")}
        description={t("billing.blurb")}
      />

      {error ? (
        <div className="pb-6">
          <Alert tone="negative" title={t("billing.loadFailed")}>
            {reason(error, t("billing.genericError"))}
          </Alert>
        </div>
      ) : null}

      {isLoading ? (
        <Panel>
          <PanelBody className="pt-5">
            <span className="skeleton block h-4 w-24" aria-hidden="true" />
            <span className="skeleton mt-3 block h-8 w-40" aria-hidden="true" />
            <span className="skeleton mt-3 block h-3.5 w-full max-w-sm" aria-hidden="true" />
            <p className="sr-only">{t("billing.loadingPlan")}</p>
          </PanelBody>
        </Panel>
      ) : null}

      {!isLoading && subscription?.needsAttention ? (
        <div className="pb-6">
          <Alert tone="warning" title={t("billing.paymentFailed")}>
            <p>{t("billing.paymentFailedBody")}</p>
            <p className="mt-2">{t("billing.paymentFailedFix")}</p>
            <Button
              variant="brand"
              size="sm"
              className="mt-3"
              loading={manage.isPending}
              onClick={() => manage.mutate()}
            >
              <CreditCard aria-hidden="true" /> {t("billing.updateCard")}
            </Button>
          </Alert>
        </div>
      ) : null}

      {manage.isError ? (
        <div className="pb-6">
          <Alert tone="negative" title={t("billing.portalFailed")}>
            {reason(manage.error, t("billing.genericError"))}
          </Alert>
        </div>
      ) : null}

      {startPro.isError ? (
        <div className="pb-6">
          <Alert tone="negative" title={t("billing.checkoutFailed")}>
            {reason(startPro.error, t("billing.genericError"))}
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
            {t("billing.comparePlans")}
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
          <p className="mt-4 text-[13px] text-muted-foreground">{t("billing.stripeNote")}</p>
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
  const { t } = useI18n();
  // A status Stripe invented since this was written falls through to t() as an
  // unknown key, which shows the raw word — better than quietly calling it
  // something it isn't on a page about money.
  const label = status ? t(STATUS_KEY[status] ?? status) : t("billing.statusActive");

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title={t("billing.proPanelTitle")}
          description={t("billing.proUnlocked")}
          action={<Badge tone={statusTone(status)}>{label}</Badge>}
        />
        <PanelBody className="grid gap-6 pt-1 sm:grid-cols-2">
          <Metric
            label={t("billing.planLabel")}
            value={PLANS.pro.name}
            emphasis="compact"
            hint={t("billing.pricePerMonth", {
              price: formatPrice(PLANS.pro.priceCents, locale),
            })}
          />
          <Metric
            label={cancelAtPeriodEnd ? t("billing.proEndsLabel") : t("billing.renewsLabel")}
            value={renews ? formatDate(renews, "long") : "—"}
            emphasis="compact"
            hint={
              renews
                ? cancelAtPeriodEnd
                  ? t("billing.lastPaidDayHint")
                  : t("billing.chargedAgainHint")
                : t("billing.noRenewalDate")
            }
          />
        </PanelBody>
        <PanelFooter>
          <Button variant="brand" loading={managing} onClick={onManage}>
            <CreditCard aria-hidden="true" /> {t("billing.manageBilling")}
          </Button>
          <span className="text-[12px] text-muted-foreground">
            {t("billing.manageBillingHint")}
          </span>
        </PanelFooter>
      </Panel>

      {cancelAtPeriodEnd ? (
        <Alert tone="neutral" title={t("billing.proEndingTitle")}>
          {/* The date sits inside the sentence, not next to it — a sentence
              built by joining a date onto a fragment lands wrong in half these
              languages. */}
          {renews ? (
            <p>{t("billing.proEndsOn", { date: formatDate(renews, "long") })}</p>
          ) : (
            <p>{t("billing.proEndsAfterPaidMonth")}</p>
          )}
          <p className="mt-2">{t("billing.changedYourMind")}</p>
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
  const { t } = useI18n();

  return (
    <Panel className={plan.featured ? "border-brand-border" : undefined}>
      <PanelHeader
        title={plan.name}
        description={plan.tagline}
        action={
          current ? (
            <Badge>{t("billing.currentPlanBadge")}</Badge>
          ) : plan.featured ? (
            <Badge tone="brand">
              <Sparkles className="size-3" aria-hidden="true" /> {t("billing.everything")}
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
            {starting ? t("billing.openingStripe") : plan.cta}
          </Button>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            {current ? t("billing.onThisPlan") : plan.cta}
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
  const { t } = useI18n();
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
            <h1 className="mt-4 text-[22px] leading-tight">{t("billing.successTitle")}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {t("billing.successBody")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild variant="brand">
                <Link to="/dashboard">
                  {t("billing.goToBooks")} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/billing">{t("billing.seeYourPlan")}</Link>
              </Button>
            </div>
          </PanelBody>
        </Panel>
      ) : waitedLongEnough ? (
        <Panel>
          <PanelBody className="pt-6">
            <h1 className="text-[22px] leading-tight">{t("billing.notConfirmedTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("billing.notConfirmedBody")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("billing.notConfirmedReassure")}
            </p>
            {error ? (
              <div className="mt-4">
                <Alert tone="neutral" title={t("billing.checkFailed")}>
                  {reason(error, t("billing.genericError"))}
                </Alert>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="brand" loading={isFetching} onClick={() => void refetch()}>
                {t("billing.checkAgain")}
              </Button>
              <Button asChild variant="outline">
                <Link to="/billing">{t("billing.goToBilling")}</Link>
              </Button>
            </div>
            <p className="mt-5 border-t pt-4 text-[13px] text-muted-foreground">
              {t("billing.contactSupport")}
            </p>
            {sessionId ? (
              <p className="num mt-1.5 break-all text-[12px] text-muted-foreground">
                {t("billing.reference", { reference: sessionId })}
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
                <span className="eyebrow">{t("billing.confirming")}</span>
              </span>
              <h1 className="mt-3 text-[22px] leading-tight">{t("billing.confirmingTitle")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("billing.confirmingBody")}</p>
            </div>
            <p className="mt-4 text-[13px] text-muted-foreground">{t("billing.canLeavePage")}</p>
          </PanelBody>
        </Panel>
      )}
    </BillingNotice>
  );
}

/* ======================================================== cancelled ====== */

export function BillingCancelled() {
  const { t } = useI18n();

  return (
    <BillingNotice>
      <Panel>
        <PanelBody className="pt-6">
          <h1 className="text-[22px] leading-tight">{t("billing.cancelledTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("billing.cancelledBody")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("billing.cancelledReassure")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/billing">{t("billing.seePlansAgain")}</Link>
            </Button>
            <Button asChild variant="brand">
              <Link to="/dashboard">
                {t("billing.backToBooks")} <ArrowRight aria-hidden="true" />
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
