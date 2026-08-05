import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";

import { createEntry, getEntries } from "@/lib/books.functions";
import { getSettings, putSettings } from "@/lib/shop.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DISMISSED_KEY = "simplebooks.onboarded";

/**
 * Shown on Today until the account has its footing: a tax rate set, or a first
 * entry logged. Disappears on its own — no settings page needed to hide it.
 */
export function Onboarding() {
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
    <section className="border-b pb-10">
      <p className="eyebrow">Getting started · {done} of 2 done</p>
      <h1 className="mt-3 text-3xl">Let&apos;s set up your books</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Two quick things and the rest of the app starts working properly.
      </p>

      {/* Step 1 — first entry */}
      <div className="mt-8 border-t pt-6">
        <div className="flex items-baseline gap-2">
          {hasEntries ? <Check className="size-4 shrink-0 text-success" /> : null}
          <p className="text-sm font-semibold">
            {hasEntries ? "First entry logged" : "Log what you made today"}
          </p>
        </div>
        {hasEntries ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Nice — your totals and charts are live now.
          </p>
        ) : (
          <form
            className="mt-3 flex max-w-sm items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (Number(amount) > 0) logFirst.mutate();
            }}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="first-amount">Money made today</Label>
              <Input
                id="first-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={logFirst.isPending || !(Number(amount) > 0)}>
              {logFirst.isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        )}
      </div>

      {/* Step 2 — tax rate */}
      <div className="mt-6 border-t pt-6">
        <div className="flex items-baseline gap-2">
          {hasRate ? <Check className="size-4 shrink-0 text-success" /> : null}
          <p className="text-sm font-semibold">
            {hasRate
              ? `Holding back ${settings?.tax_rate_percent}% for tax`
              : "Decide what to hold back for tax"}
          </p>
        </div>
        {hasRate ? (
          <p className="mt-1 text-sm text-muted-foreground">
            You can change this any time under Tools.
          </p>
        ) : (
          <form
            className="mt-3 flex max-w-sm items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (Number(rate) > 0) setTax.mutate();
            }}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="first-rate">Percentage of income</Label>
              <Input
                id="first-rate"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                placeholder="25"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={setTax.isPending}>
              {setTax.isPending ? "Saving…" : "Set"}
            </Button>
          </form>
        )}
        {!hasRate ? (
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            A rough guess is fine — 25% is a common starting point. Check the real figure with an
            accountant; this just stops the bill being a surprise.
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={hide}
        className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Skip this
      </button>
    </section>
  );
}
