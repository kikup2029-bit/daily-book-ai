/**
 * The individual cards that make up "This month", each addressable on its own
 * so the sidebar can link straight to one. They all read from the same cached
 * insights query, so showing them separately costs no extra requests.
 *
 * Each card is a panel, so a route can drop one on a page and it sits at the
 * same elevation as everything else in the app.
 *
 * Every sentence here comes out of the `month` section of the dictionary whole.
 * A figure and the words around it — "lowest point is X on Y", "typical day: X
 * in, Y out" — are one key each, because where the number falls against the
 * words is a property of the language, not of the layout.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getInsights } from "@/lib/shop.functions";
import { Alert, Metric, Money, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";
import { bestAndQuietKey } from "@/components/sections/month-sections";
import { useI18n } from "@/lib/i18n";

function useInsights() {
  const fetchInsights = useServerFn(getInsights);
  return useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });
}

function Loading({ label }: { label: string }) {
  return (
    <Panel className="mb-6" aria-busy="true" aria-label={label}>
      <PanelBody className="pt-5">
        <span className="skeleton block h-3 w-44" />
        <span className="skeleton mt-5 block h-10 w-56" />
        <span className="skeleton mt-4 block h-3.5 w-full max-w-xs" />
      </PanelBody>
    </Panel>
  );
}

// --- Your week in plain English ------------------------------------------

export function WeekDigestCard() {
  const { t } = useI18n();
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label={t("month.loadingWeek")} />;
  if (!data) return null;
  const { digest } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        title={t("month.weekTitle")}
        description={
          <span className="num">
            {t("month.weekRange", { from: digest.weekFrom, to: digest.weekTo })}
          </span>
        }
      />
      <PanelBody>
        <ul className="space-y-2.5 text-sm">
          {digest.lines.map((line, index) => (
            <li key={index} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-brand"
              />
              <span className="min-w-0">{line}</span>
            </li>
          ))}
        </ul>
      </PanelBody>
    </Panel>
  );
}

// --- Can you cover what's coming? ----------------------------------------

export function OutlookCard() {
  const { t, money, signedMoney, formatNumber } = useI18n();
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label={t("month.loadingOutlook")} />;
  if (!data) return null;
  const { forecast } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        title={t("month.outlookTitle")}
        description={t("month.outlookBlurb", {
          days: formatNumber(forecast.horizonDays),
          count: forecast.basedOnDays,
        })}
      />
      <PanelBody className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Metric
            label={t("month.whereYouAre")}
            value={<Money value={forecast.currentNet} signed />}
          />
          <Metric
            label={t("month.inDays", { count: forecast.horizonDays })}
            value={<Money value={forecast.projectedNet} signed />}
          />
        </div>

        {forecast.shortfallDate ? (
          <Alert tone="negative" title={t("month.shortfallTitle", { date: forecast.shortfallDate })}>
            <span className="num">
              {t("month.lowestPoint", {
                amount: signedMoney(forecast.lowestPoint.balance),
                date: forecast.lowestPoint.date,
              })}
            </span>
          </Alert>
        ) : (
          <Alert tone="positive" title={t("month.staysPositive")}>
            <span className="num">
              {t("month.lowestPoint", {
                amount: signedMoney(forecast.lowestPoint.balance),
                date: forecast.lowestPoint.date,
              })}
            </span>
          </Alert>
        )}

        <p className="num text-[13px] text-muted-foreground">
          {t("month.typicalDay", {
            moneyIn: money(forecast.dailyIn),
            moneyOut: money(forecast.dailyOut),
          })}
        </p>

        {forecast.upcomingBills.length > 0 ? (
          <div className="rounded-[var(--radius-12)] border bg-surface-2 px-4 py-3">
            <p className="eyebrow">{t("month.billsComingUp")}</p>
            <ul className="divide-hairline mt-1">
              {forecast.upcomingBills.slice(0, 6).map((bill, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between gap-3 py-2 text-[13px] sm:text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{bill.category}</span>
                    <span className="num ml-2 text-muted-foreground">{bill.due}</span>
                  </span>
                  <Money value={bill.amount} className="shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {forecast.lowConfidence ? (
          <p className="text-xs text-muted-foreground">
            {t("month.roughGuess", { count: forecast.basedOnDays })}
          </p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

// --- Tax set-aside --------------------------------------------------------

export function TaxJarCard() {
  const { t, money, formatNumber } = useI18n();
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label={t("month.loadingTax")} />;
  if (!data) return null;
  const { tax } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        className={tax.ratePercent <= 0 ? "pb-5" : undefined}
        title={t("nav.tax")}
        description={tax.ratePercent <= 0 ? t("month.taxNoRateBelow") : undefined}
      />
      {tax.ratePercent > 0 ? (
        <PanelBody className="space-y-6">
          <p className="text-[13px] text-muted-foreground">
            {t("month.taxHoldingBack", {
              percent: formatNumber(tax.ratePercent),
              amount: money(tax.incomeInPeriod),
              period: tax.periodLabel,
            })}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Metric
              label={t("month.shouldSetAside")}
              emphasis="compact"
              value={<Money value={tax.shouldHaveSetAside} />}
            />
            <Metric
              label={t("month.alreadyPaid")}
              emphasis="compact"
              tone="positive"
              value={<Money value={tax.alreadyPaid} />}
            />
          </div>

          <div className="border-t pt-6">
            <Metric
              label={t("month.stillToSetAside")}
              emphasis="hero"
              value={<Money value={tax.stillToSetAside} />}
              hint={t("month.taxHint")}
            />
          </div>
        </PanelBody>
      ) : null}
    </Panel>
  );
}

// --- Busy and quiet days --------------------------------------------------

export function BusyDaysCard() {
  const { t, formatNumber } = useI18n();
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label={t("month.loadingBusyDays")} />;
  if (!data) return null;
  const { dayPatterns } = data;

  if (!dayPatterns.enoughData || !dayPatterns.best || !dayPatterns.worst) {
    return (
      <Panel className="mb-6">
        <PanelHeader
          className="pb-5"
          title={t("nav.busyDays")}
          description={t("month.busyDaysNotEnough")}
        />
      </Panel>
    );
  }

  const best = dayPatterns.best;
  const worst = dayPatterns.worst;

  return (
    <Panel className="mb-6">
      <PanelHeader title={t("nav.busyDays")} description={t("month.busyDaysBlurb")} />
      <PanelBody className="space-y-5">
        <div className="space-y-2.5">
          {[...dayPatterns.patterns]
            .sort((a, b) => b.averageIn - a.averageIn)
            .map((pattern) => {
              const max = best.averageIn || 1;
              const width = Math.max(2, (pattern.averageIn / max) * 100);
              return (
                <div
                  key={pattern.weekday}
                  className="flex items-center gap-3 text-[13px] sm:text-sm"
                >
                  <span className="w-[68px] shrink-0 truncate text-muted-foreground sm:w-20">
                    {pattern.label}
                  </span>
                  <span
                    className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-3"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full bg-brand transition-[width] duration-[var(--dur)] ease-[var(--ease)]"
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <Money
                    value={pattern.averageIn}
                    className="w-[76px] shrink-0 text-right sm:w-24"
                  />
                </div>
              );
            })}
        </div>

        {/* One sentence, picked whole — the bracketed percentages are part of
            it, not something a component can bolt on afterwards. */}
        <p className="text-sm text-muted-foreground">
          {t(bestAndQuietKey(best.vsAverage, worst.vsAverage), {
            best: best.label,
            worst: worst.label,
            bestPercent: formatNumber(Math.round(best.vsAverage)),
            worstPercent: formatNumber(Math.round(Math.abs(worst.vsAverage))),
          })}
        </p>
      </PanelBody>
    </Panel>
  );
}
