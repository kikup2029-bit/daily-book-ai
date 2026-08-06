/**
 * The real screen, built out of the real components, filled with made-up money.
 *
 * Not a screenshot and not stock art: it imports the same Panel, Metric, Money
 * and Badge the dashboard imports, so it can't drift away from the product the
 * way an exported image would. Nothing here is fetched and none of it is
 * anyone's data — the figures are round, obviously invented, and the whole
 * block is captioned as an example.
 */

import { ArrowDownCircle, ArrowUpCircle, CalendarClock } from "lucide-react";

import { Badge, Metric, Money, Panel, PanelBody, TxRow } from "@/components/ui/kit";

/** Invented takings for a made-up market stall. */
const EXAMPLE = {
  net: 412.5,
  moneyIn: 865,
  moneyOut: 452.5,
  allIn: 18240,
  allOut: 11905.5,
  billsDue: 240,
};

const EXAMPLE_ENTRIES = [
  { date: "Mon 4", title: "Stall takings — morning", subtitle: "Cash", amount: 240 },
  { date: "Mon 4", title: "Wholesaler — vegetables", subtitle: "Card", amount: -182.5 },
  { date: "Sun 3", title: "Invoice #104 paid", subtitle: "Bank transfer", amount: 625 },
  { date: "Sun 3", title: "Van diesel", subtitle: "Card", amount: -70 },
];

const EXAMPLE_BILLS = [
  { name: "Pitch rent", when: "due tomorrow", amount: 140 },
  { name: "Phone", when: "due in 3 days", amount: 100 },
];

export function ProductPreview() {
  return (
    <div className="px-4 pb-14 pt-6 sm:px-6 sm:pb-20">
      <figure className="mx-auto w-full max-w-5xl">
        <div className="rounded-[var(--radius-18)] border border-border bg-surface-2 p-2 shadow-[var(--shadow-lg)] sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-1 sm:mb-3">
            <p className="eyebrow">Today</p>
            <Badge tone="brand">Example screen</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            {/* Where you stand — the one loud number on the screen. */}
            <Panel className="p-5 lg:col-span-3">
              <Metric
                label="Today's net"
                emphasis="hero"
                value={<Money value={EXAMPLE.net} signed />}
                hint="You're ahead on the day."
              />

              <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                <Metric
                  label="Money in"
                  emphasis="compact"
                  icon={<ArrowUpCircle className="size-3.5 text-success" aria-hidden="true" />}
                  value={<Money value={EXAMPLE.moneyIn} tone="positive" />}
                />
                <Metric
                  label="Money out"
                  emphasis="compact"
                  icon={<ArrowDownCircle className="size-3.5 text-danger" aria-hidden="true" />}
                  value={<Money value={EXAMPLE.moneyOut} tone="negative" />}
                />
              </div>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className="eyebrow">All time</span>
                <span className="inline-flex items-baseline gap-1">
                  <Money value={EXAMPLE.allIn} tone="positive" className="font-medium" /> in
                </span>
                <span className="inline-flex items-baseline gap-1">
                  <Money value={EXAMPLE.allOut} tone="negative" className="font-medium" /> out
                </span>
              </p>
            </Panel>

            {/* What needs you. */}
            <Panel className="border-warning/40 lg:col-span-2">
              <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold leading-tight">
                    <CalendarClock className="size-4 shrink-0 text-warning" aria-hidden="true" />
                    <span className="num">2</span> bills due soon
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Worth covering before it catches you out.
                  </p>
                </div>
                <Badge tone="warning" className="shrink-0">
                  <Money value={EXAMPLE.billsDue} />
                </Badge>
              </div>

              <PanelBody>
                <ul className="divide-hairline">
                  {EXAMPLE_BILLS.map((bill) => (
                    <li
                      key={bill.name}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate">{bill.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-[12px] text-muted-foreground">{bill.when}</span>
                        <Money value={bill.amount} className="font-medium" />
                      </span>
                    </li>
                  ))}
                </ul>
              </PanelBody>
            </Panel>
          </div>

          {/* What just happened. */}
          <Panel className="mt-3">
            <div className="px-5 pb-1 pt-4">
              <p className="text-[15px] font-semibold leading-tight">Recent entries</p>
            </div>
            <PanelBody>
              <div className="divide-hairline">
                {EXAMPLE_ENTRIES.map((entry) => (
                  <TxRow
                    key={`${entry.date}-${entry.title}`}
                    date={entry.date}
                    title={entry.title}
                    subtitle={entry.subtitle}
                    amount={entry.amount}
                  />
                ))}
              </div>
            </PanelBody>
          </Panel>
        </div>

        <figcaption className="mx-auto mt-4 max-w-xl text-center text-[13px] text-muted-foreground">
          An example of the daily screen. Every figure above is made up for illustration — it
          isn&rsquo;t a real business and it isn&rsquo;t anyone&rsquo;s data.
        </figcaption>
      </figure>
    </div>
  );
}
