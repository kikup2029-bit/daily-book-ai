/**
 * The real screen, built out of the real components, filled with made-up money.
 *
 * Not a screenshot and not stock art: it imports the same Panel, Metric, Money
 * and Badge the dashboard imports, so it can't drift away from the product the
 * way an exported image would. Nothing here is fetched and none of it is
 * anyone's data — the figures are round, obviously invented, and the whole
 * block is captioned as an example.
 */

import { useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, CalendarClock } from "lucide-react";

import { Badge, Metric, Money, Panel, PanelBody, TxRow } from "@/components/ui/kit";
import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

/** Invented takings for a made-up market stall. Numbers, so no translation. */
const EXAMPLE = {
  net: 412.5,
  moneyIn: 865,
  moneyOut: 452.5,
  allIn: 18240,
  allOut: 11905.5,
  billsDue: 240,
  billCount: 2,
  invoiceNumber: 104,
  phoneBillDays: 3,
};

/**
 * Where a <Money> amount sits inside a sentence.
 *
 * No value is passed for it, so `interpolate` leaves it alone and the string can
 * be split here — which lets a translator put the amount wherever the sentence
 * needs it instead of forcing English's "<amount> in" order.
 */
const AMOUNT_SLOT = "{amount}";

/** The same trick for the bill count, which is rendered in a `num` span. */
const COUNT_SLOT = "{number}";

/**
 * Functions of `t`, not module constants: a constant is evaluated once at import
 * and would show whichever language loaded first even after the reader switches.
 */
function exampleEntries(t: Translator) {
  return [
    {
      id: "takings",
      date: t("landing.previewDateMonday"),
      title: t("landing.previewEntryTakings"),
      subtitle: t("landing.previewMethodCash"),
      amount: 240,
    },
    {
      id: "wholesaler",
      date: t("landing.previewDateMonday"),
      title: t("landing.previewEntryWholesaler"),
      subtitle: t("landing.previewMethodCard"),
      amount: -182.5,
    },
    {
      id: "invoice",
      date: t("landing.previewDateSunday"),
      title: t("landing.previewEntryInvoicePaid", { number: EXAMPLE.invoiceNumber }),
      subtitle: t("landing.previewMethodBankTransfer"),
      amount: 625,
    },
    {
      id: "diesel",
      date: t("landing.previewDateSunday"),
      title: t("landing.previewEntryDiesel"),
      subtitle: t("landing.previewMethodCard"),
      amount: -70,
    },
  ];
}

function exampleBills(t: Translator) {
  return [
    {
      id: "rent",
      name: t("landing.previewBillRent"),
      when: t("landing.previewBillDueTomorrow"),
      amount: 140,
    },
    {
      id: "phone",
      name: t("landing.previewBillPhone"),
      when: t("landing.previewBillDueInDays", { count: EXAMPLE.phoneBillDays }),
      amount: 100,
    },
  ];
}

export function ProductPreview() {
  const { t } = useI18n();
  const entries = useMemo(() => exampleEntries(t), [t]);
  const bills = useMemo(() => exampleBills(t), [t]);

  // `count` picks the plural form; it never appears in the string, so the
  // {number} slot survives interpolation and the split below finds it.
  const [beforeCount, afterCount] = t("landing.previewBillsDue", {
    count: EXAMPLE.billCount,
  }).split(COUNT_SLOT);
  const [beforeAllIn, afterAllIn] = t("landing.previewAllTimeIn").split(AMOUNT_SLOT);
  const [beforeAllOut, afterAllOut] = t("landing.previewAllTimeOut").split(AMOUNT_SLOT);

  return (
    <div className="px-4 pb-14 pt-6 sm:px-6 sm:pb-20">
      <figure className="mx-auto w-full max-w-5xl">
        <div className="rounded-[var(--radius-18)] border border-border bg-surface-2 p-2 shadow-[var(--shadow-lg)] sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2 px-2 pt-1 sm:mb-3">
            <p className="eyebrow">{t("landing.previewToday")}</p>
            <Badge tone="brand">{t("landing.previewExampleBadge")}</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            {/* Where you stand — the one loud number on the screen. */}
            <Panel className="p-5 lg:col-span-3">
              <Metric
                label={t("landing.previewNetLabel")}
                emphasis="hero"
                value={<Money value={EXAMPLE.net} signed />}
                hint={t("landing.previewNetHint")}
              />

              <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                <Metric
                  label={t("landing.previewMoneyIn")}
                  emphasis="compact"
                  icon={<ArrowUpCircle className="size-3.5 text-success" aria-hidden="true" />}
                  value={<Money value={EXAMPLE.moneyIn} tone="positive" />}
                />
                <Metric
                  label={t("landing.previewMoneyOut")}
                  emphasis="compact"
                  icon={<ArrowDownCircle className="size-3.5 text-danger" aria-hidden="true" />}
                  value={<Money value={EXAMPLE.moneyOut} tone="negative" />}
                />
              </div>

              <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span className="eyebrow">{t("landing.previewAllTime")}</span>
                <span className="inline-flex items-baseline gap-1">
                  {beforeAllIn}
                  <Money value={EXAMPLE.allIn} tone="positive" className="font-medium" />
                  {afterAllIn}
                </span>
                <span className="inline-flex items-baseline gap-1">
                  {beforeAllOut}
                  <Money value={EXAMPLE.allOut} tone="negative" className="font-medium" />
                  {afterAllOut}
                </span>
              </p>
            </Panel>

            {/* What needs you. */}
            <Panel className="border-warning/40 lg:col-span-2">
              <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] font-semibold leading-tight">
                    <CalendarClock className="size-4 shrink-0 text-warning" aria-hidden="true" />
                    {beforeCount}
                    <span className="num">{EXAMPLE.billCount}</span>
                    {afterCount}
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {t("landing.previewBillsHint")}
                  </p>
                </div>
                <Badge tone="warning" className="shrink-0">
                  <Money value={EXAMPLE.billsDue} />
                </Badge>
              </div>

              <PanelBody>
                <ul className="divide-hairline">
                  {bills.map((bill) => (
                    <li
                      key={bill.id}
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
              <p className="text-[15px] font-semibold leading-tight">
                {t("landing.previewRecentEntries")}
              </p>
            </div>
            <PanelBody>
              <div className="divide-hairline">
                {entries.map((entry) => (
                  <TxRow
                    key={entry.id}
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
          {t("landing.previewCaption")}
        </figcaption>
      </figure>
    </div>
  );
}
