/**
 * The individual cards that make up "This month", each addressable on its own
 * so the sidebar can link straight to one. They all read from the same cached
 * insights query, so showing them separately costs no extra requests.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getInsights } from "@/lib/shop.functions";

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function useInsights() {
  const fetchInsights = useServerFn(getInsights);
  return useQuery({ queryKey: ["insights"], queryFn: () => fetchInsights() });
}

function Loading({ label }: { label: string }) {
  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
    </section>
  );
}

// --- Your week in plain English ------------------------------------------

export function WeekDigestCard() {
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Reading your week…" />;
  if (!data) return null;
  const { digest } = data;

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Your week in plain English</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {digest.weekFrom} to {digest.weekTo}
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {digest.lines.map((line, index) => (
          <li key={index} className="flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// --- Can you cover what's coming? ----------------------------------------

export function OutlookCard() {
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Working out your outlook…" />;
  if (!data) return null;
  const { forecast } = data;

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Can you cover what&apos;s coming?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Next {forecast.horizonDays} days, based on your last {forecast.basedOnDays} days and the
        bills you&apos;ve set up.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Where you are
          </p>
          <p className="mt-0.5 text-lg font-bold">{money(forecast.currentNet)}</p>
        </div>
        <div
          className={`rounded-2xl p-3 ${
            forecast.projectedNet >= 0 ? "bg-success-soft" : "bg-danger-soft"
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              forecast.projectedNet >= 0 ? "text-success" : "text-danger"
            }`}
          >
            In {forecast.horizonDays} days
          </p>
          <p className="mt-0.5 text-lg font-bold">
            {forecast.projectedNet < 0 ? "−" : ""}
            {money(forecast.projectedNet)}
          </p>
        </div>
      </div>

      {forecast.shortfallDate ? (
        <div className="mt-3 rounded-2xl bg-danger p-3 text-danger-foreground">
          <p className="text-sm font-semibold">
            Heads up — you could run short around {forecast.shortfallDate}.
          </p>
          <p className="mt-0.5 text-xs">
            Lowest point is {money(forecast.lowestPoint.balance)} on {forecast.lowestPoint.date}.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-success">
          You stay in the black the whole time — lowest point is{" "}
          {money(forecast.lowestPoint.balance)} on {forecast.lowestPoint.date}.
        </p>
      )}

      <p className="mt-3 text-sm text-muted-foreground">
        Typical day: {money(forecast.dailyIn)} in, {money(forecast.dailyOut)} out.
      </p>

      {forecast.upcomingBills.length > 0 ? (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bills coming up
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {forecast.upcomingBills.slice(0, 6).map((bill, index) => (
              <li key={index} className="flex justify-between gap-2">
                <span>
                  {bill.category} <span className="text-muted-foreground">· {bill.due}</span>
                </span>
                <span className="tabular-nums">{money(bill.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {forecast.lowConfidence ? (
        <p className="mt-3 text-xs text-muted-foreground">
          This is a rough guess — you&apos;ve only got {forecast.basedOnDays} days logged. It gets
          more accurate as you keep going.
        </p>
      ) : null}
    </section>
  );
}

// --- Tax set-aside --------------------------------------------------------

export function TaxJarCard() {
  const { data, isLoading } = useInsights();
  if (isLoading) return <Loading label="Adding up your tax set-aside…" />;
  if (!data) return null;
  const { tax } = data;

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Tax set-aside</h2>
      {tax.ratePercent <= 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Set a percentage below and I&apos;ll keep a running total of what to hold back for tax.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Holding back {tax.ratePercent}% of the {money(tax.incomeInPeriod)} you&apos;ve taken in{" "}
            {tax.periodLabel}.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Should set aside
              </p>
              <p className="mt-0.5 text-lg font-bold">{money(tax.shouldHaveSetAside)}</p>
            </div>
            <div className="rounded-2xl bg-success-soft p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">
                Already paid
              </p>
              <p className="mt-0.5 text-lg font-bold">{money(tax.alreadyPaid)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-primary p-3 text-center text-primary-foreground">
            <p className="text-sm font-semibold">Still to put aside</p>
            <p className="mt-0.5 text-2xl font-bold">{money(tax.stillToSetAside)}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Log tax payments with &ldquo;tax&rdquo; in the category and they&apos;ll count here. Not
            tax advice — confirm your rate with an accountant.
          </p>
        </>
      )}
    </section>
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
      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-bold">Your busy and quiet days</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep logging for a few more weeks and I&apos;ll show which days of the week are your
          best and quietest.
        </p>
      </section>
    );
  }

  const best = dayPatterns.best;
  const worst = dayPatterns.worst;

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold">Your busy and quiet days</h2>
      <p className="mt-1 text-sm text-muted-foreground">Average money in per day of the week.</p>

      <div className="mt-4 space-y-2">
        {[...dayPatterns.patterns]
          .sort((a, b) => b.averageIn - a.averageIn)
          .map((pattern) => {
            const max = best.averageIn || 1;
            const width = Math.max(2, (pattern.averageIn / max) * 100);
            return (
              <div key={pattern.weekday} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-muted-foreground">{pattern.label}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span className="w-20 shrink-0 text-right tabular-nums">
                  {money(pattern.averageIn)}
                </span>
              </div>
            );
          })}
      </div>

      <p className="mt-4 text-sm">
        <span className="font-semibold">{best.label}</span> is your best day
        {best.vsAverage > 5 ? ` (${Math.round(best.vsAverage)}% above your average)` : ""}, and{" "}
        <span className="font-semibold">{worst.label}</span> is your quietest
        {worst.vsAverage < -5 ? ` (${Math.round(Math.abs(worst.vsAverage))}% below)` : ""}.
      </p>
    </section>
  );
}
