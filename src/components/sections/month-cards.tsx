/**
 * The individual cards that make up "This month", each addressable on its own
 * so the sidebar can link straight to one. They all read from the same cached
 * insights query, so showing them separately costs no extra requests.
 *
 * Each card is a panel, so a route can drop one on a page and it sits at the
 * same elevation as everything else in the app.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getInsights } from "@/lib/shop.functions";
import { Alert, Metric, Money, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";

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
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Reading your week…" />;
  if (!data) return null;
  const { digest } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        title="Your week in plain English"
        description={
          <span className="num">
            {digest.weekFrom} to {digest.weekTo}
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
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Working out your outlook…" />;
  if (!data) return null;
  const { forecast } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        title="Can you cover what's coming?"
        description={`Next ${forecast.horizonDays} days, based on your last ${forecast.basedOnDays} days and the bills you've set up.`}
      />
      <PanelBody className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Metric label="Where you are" value={<Money value={forecast.currentNet} signed />} />
          <Metric
            label={`In ${forecast.horizonDays} days`}
            value={<Money value={forecast.projectedNet} signed />}
          />
        </div>

        {forecast.shortfallDate ? (
          <Alert
            tone="negative"
            title={`Heads up — you could run short around ${forecast.shortfallDate}.`}
          >
            <span>
              Lowest point is <Money value={forecast.lowestPoint.balance} signed /> on{" "}
              <span className="num">{forecast.lowestPoint.date}</span>.
            </span>
          </Alert>
        ) : (
          <Alert tone="positive" title="You stay in the black the whole time.">
            <span>
              Lowest point is <Money value={forecast.lowestPoint.balance} signed /> on{" "}
              <span className="num">{forecast.lowestPoint.date}</span>.
            </span>
          </Alert>
        )}

        <p className="text-[13px] text-muted-foreground">
          Typical day: <Money value={forecast.dailyIn} className="text-foreground" /> in,{" "}
          <Money value={forecast.dailyOut} className="text-foreground" /> out.
        </p>

        {forecast.upcomingBills.length > 0 ? (
          <div className="rounded-[var(--radius-12)] border bg-surface-2 px-4 py-3">
            <p className="eyebrow">Bills coming up</p>
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
            This is a rough guess — you&apos;ve only got{" "}
            <span className="num">{forecast.basedOnDays}</span> days logged. It gets more accurate
            as you keep going.
          </p>
        ) : null}
      </PanelBody>
    </Panel>
  );
}

// --- Tax set-aside --------------------------------------------------------

export function TaxJarCard() {
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Adding up your tax set-aside…" />;
  if (!data) return null;
  const { tax } = data;

  return (
    <Panel className="mb-6">
      <PanelHeader
        className={tax.ratePercent <= 0 ? "pb-5" : undefined}
        title="Tax set-aside"
        description={
          tax.ratePercent <= 0
            ? "Set a percentage below and I'll keep a running total of what to hold back for tax."
            : undefined
        }
      />
      {tax.ratePercent > 0 ? (
        <PanelBody className="space-y-6">
          <p className="text-[13px] text-muted-foreground">
            Holding back <span className="num text-foreground">{tax.ratePercent}%</span> of the{" "}
            <Money value={tax.incomeInPeriod} className="text-foreground" /> you&apos;ve taken in{" "}
            {tax.periodLabel}.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Metric
              label="Should set aside"
              emphasis="compact"
              value={<Money value={tax.shouldHaveSetAside} />}
            />
            <Metric
              label="Already paid"
              emphasis="compact"
              tone="positive"
              value={<Money value={tax.alreadyPaid} />}
            />
          </div>

          <div className="border-t pt-6">
            <Metric
              label="Still to put aside"
              emphasis="hero"
              value={<Money value={tax.stillToSetAside} />}
              hint="Log tax payments with “tax” in the category and they’ll count here. Not tax advice — confirm your rate with an accountant."
            />
          </div>
        </PanelBody>
      ) : null}
    </Panel>
  );
}

// --- Busy and quiet days --------------------------------------------------

export function BusyDaysCard() {
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Looking at your week…" />;
  if (!data) return null;
  const { dayPatterns } = data;

  if (!dayPatterns.enoughData || !dayPatterns.best || !dayPatterns.worst) {
    return (
      <Panel className="mb-6">
        <PanelHeader
          className="pb-5"
          title="Your busy and quiet days"
          description="Keep logging for a few more weeks and I'll show which days of the week are your best and quietest."
        />
      </Panel>
    );
  }

  const best = dayPatterns.best;
  const worst = dayPatterns.worst;

  return (
    <Panel className="mb-6">
      <PanelHeader
        title="Your busy and quiet days"
        description="Average money in per day of the week."
      />
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

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{best.label}</span> is your best day
          {best.vsAverage > 5 ? (
            <>
              {" "}
              (<span className="num">{Math.round(best.vsAverage)}%</span> above your average)
            </>
          ) : null}
          , and <span className="font-semibold text-foreground">{worst.label}</span> is your
          quietest
          {worst.vsAverage < -5 ? (
            <>
              {" "}
              (<span className="num">{Math.round(Math.abs(worst.vsAverage))}%</span> below)
            </>
          ) : null}
          .
        </p>
      </PanelBody>
    </Panel>
  );
}
