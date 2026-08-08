import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";

import { createEntry, getEntries } from "@/lib/books.functions";
import { getSettings, putSettings } from "@/lib/shop.functions";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";

const DISMISSED_KEY = "simplebooks.onboarded";

/** How many steps the checklist has, so the progress line isn't a stray literal. */
const TOTAL_STEPS = 2;

/**
 * Shown on Today until the account has its footing: a tax rate set, or a first
 * entry logged. Disappears on its own — no settings page needed to hide it.
 */
export function Onboarding() {
  const { t, formatNumber } = useI18n();
  const queryClient = useQueryClient();
  const fetchEntries = useServerFn(getEntries);
  const fetchSettings = useServerFn(getSettings);
  const saveSettings = useServerFn(putSettings);
  const addEntry = useServerFn(createEntry);

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(),
  });
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [rate, setRate] = useState("25");
  const [amount, setAmount] = useState("");

  const hasEntries = entries.length > 0;
  const hasRate = (settings?.tax_rate_percent ?? 0) > 0;

  const setTax = useMutation({
    mutationFn: () =>
      saveSettings({
        data: {
          tax_rate_percent: Number(rate || 0),
          opening_float: settings?.opening_float ?? 0,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  const logFirst = useMutation({
    mutationFn: () =>
      addEntry({
        data: {
          entry_date: new Date().toLocaleDateString("en-CA"),
          amount_in: Number(amount || 0),
          amount_out: 0,
          spent_on: null,
          merchant: null,
          payment_method: "cash",
          share: "private",
        },
      }),
    onSuccess: () => {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  const hide = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not remembering is fine; it'll vanish once there's data anyway.
    }
    setDismissed(true);
  };

  // Don't flash while loading, and get out of the way once set up.
  if (entriesLoading || settingsLoading) return null;
  if (dismissed) return null;
  if (hasEntries && hasRate) return null;

  const done = [hasEntries, hasRate].filter(Boolean).length;

  return (
    <section className="mb-8">
      <Panel className="overflow-hidden">
        <PanelHeader
          title={t("onboarding.title")}
          description={t("onboarding.blurb")}
          action={
            <span className="eyebrow num whitespace-nowrap">
              {t("onboarding.stepsDone", { count: done, total: TOTAL_STEPS })}
            </span>
          }
        />

        <PanelBody className="pb-0">
          {/* Progress */}
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={done}
            aria-label={t("onboarding.progressLabel")}
          >
            {[hasEntries, hasRate].map((complete, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-[var(--dur)] ease-[var(--ease)] ${
                  complete ? "bg-brand" : "bg-surface-3"
                }`}
              />
            ))}
          </div>
        </PanelBody>

        <div className="mt-5 divide-hairline border-t">
          {/* Step 1 — first entry */}
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-px flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  hasEntries
                    ? "bg-success-soft text-success"
                    : "border border-brand-border bg-brand-soft text-foreground"
                }`}
              >
                {hasEntries ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="num">{formatNumber(1)}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-6">
                  {hasEntries ? t("onboarding.entryStepDone") : t("onboarding.entryStepTitle")}
                </p>

                {hasEntries ? (
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {t("onboarding.entryStepDoneBlurb")}
                  </p>
                ) : (
                  <form
                    className="mt-3 flex max-w-sm flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (Number(amount) > 0) logFirst.mutate();
                    }}
                  >
                    <Field
                      id="first-amount"
                      label={t("onboarding.amountLabel")}
                      className="min-w-[8rem] flex-1"
                    >
                      <Input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="num"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                    </Field>
                    <Button
                      type="submit"
                      variant="brand"
                      className="h-11 md:h-10"
                      disabled={logFirst.isPending || !(Number(amount) > 0)}
                    >
                      {logFirst.isPending ? t("common.saving") : t("common.save")}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 — tax rate */}
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-px flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                  hasRate
                    ? "bg-success-soft text-success"
                    : "border border-brand-border bg-brand-soft text-foreground"
                }`}
              >
                {hasRate ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="num">{formatNumber(2)}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-6">
                  {hasRate
                    ? t("onboarding.taxStepDone", {
                        rate: formatNumber(settings?.tax_rate_percent ?? 0),
                      })
                    : t("onboarding.taxStepTitle")}
                </p>

                {hasRate ? (
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {t("onboarding.taxStepDoneBlurb", { section: t("nav.tools") })}
                  </p>
                ) : (
                  <>
                    <form
                      className="mt-3 flex max-w-sm flex-wrap items-end gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (Number(rate) > 0) setTax.mutate();
                      }}
                    >
                      <Field
                        id="first-rate"
                        label={t("onboarding.rateLabel")}
                        className="min-w-[8rem] flex-1"
                      >
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="100"
                          placeholder="25"
                          className="num"
                          value={rate}
                          onChange={(event) => setRate(event.target.value)}
                        />
                      </Field>
                      <Button
                        type="submit"
                        variant="brand"
                        className="h-11 md:h-10"
                        disabled={setTax.isPending}
                      >
                        {setTax.isPending ? t("common.saving") : t("onboarding.setRate")}
                      </Button>
                    </form>
                    <p className="mt-2.5 max-w-prose text-[12px] leading-relaxed text-muted-foreground">
                      {t("onboarding.taxHint")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-t px-5 py-2.5">
          <button
            type="button"
            onClick={hide}
            className="-ml-2 inline-flex h-10 items-center rounded-[var(--radius-10)] px-2 text-[12px] text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground"
          >
            {t("onboarding.skip")}
          </button>
        </div>
      </Panel>
    </section>
  );
}
