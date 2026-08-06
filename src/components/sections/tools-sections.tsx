/**
 * Section components shared by the sidebar routes.
 * Extracted from the original single-page layout so each route can render
 * just the part it needs.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Lock, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Alert,
  Badge,
  Field,
  Metric,
  Money,
  PageHeader,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  Select,
  SkeletonRows,
} from "@/components/ui/kit";
import { getEntries } from "@/lib/books.functions";
import {
  getCashCounts,
  getProducts,
  getSettings,
  putSettings,
  removeAppLock,
  removeCashCount,
  removeProduct,
  saveCashCount,
  saveProduct,
  setAppLock,
} from "@/lib/shop.functions";
import { validatePin } from "@/lib/pin";
import { averageMonthlyOverhead, productMargin, reconcileDrawer } from "@/lib/insights";
import {
  enterHousehold,
  exitHousehold,
  getHousehold,
  getSettlement,
  setMemberName,
  startHousehold,
} from "@/lib/household.functions";

const todayISO = () => new Date().toLocaleDateString("en-CA");

/** Every page in this file sits in the same column so they feel like one app. */
const page = "rise mx-auto w-full max-w-3xl";

/** A small icon-only "remove this row" control. */
function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="shrink-0 hover:text-danger"
    >
      <X className="size-4" aria-hidden="true" />
    </Button>
  );
}

// =========================================================================
// Household sharing
// =========================================================================

export function HouseholdSection() {
  const queryClient = useQueryClient();
  const fetchHousehold = useServerFn(getHousehold);
  const fetchSettlement = useServerFn(getSettlement);
  const create = useServerFn(startHousehold);
  const join = useServerFn(enterHousehold);
  const leave = useServerFn(exitHousehold);
  const rename = useServerFn(setMemberName);

  const { data: state } = useQuery({ queryKey: ["household"], queryFn: () => fetchHousehold() });
  const { data: settleData } = useQuery({
    queryKey: ["settlement"],
    queryFn: () => fetchSettlement(),
    enabled: Boolean(state?.household),
  });

  const [name, setName] = useState("");
  const [yourName, setYourName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["household"] });
    queryClient.invalidateQueries({ queryKey: ["settlement"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    queryClient.invalidateQueries({ queryKey: ["insights"] });
  };

  const onError = (err: Error) => setError(err.message);

  const createMutation = useMutation({
    mutationFn: () =>
      create({ data: { name: name.trim(), display_name: yourName.trim() || null } }),
    onSuccess: () => {
      setName("");
      setYourName("");
      setError(null);
      refresh();
    },
    onError,
  });

  const joinMutation = useMutation({
    mutationFn: () =>
      join({ data: { join_code: code.trim(), display_name: yourName.trim() || null } }),
    onSuccess: () => {
      setCode("");
      setYourName("");
      setError(null);
      refresh();
    },
    onError,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leave({}),
    onSuccess: () => {
      setError(null);
      refresh();
    },
    onError,
  });

  const renameMutation = useMutation({
    mutationFn: (value: string) => rename({ data: { display_name: value || null } }),
    onSuccess: refresh,
    onError,
  });

  // --- not in a household yet ---
  if (!state?.household) {
    return (
      <div className={page}>
        <PageHeader
          eyebrow="Tools"
          title="Share with someone"
          description="Share the entries you choose with a partner or housemate, and split costs fairly. Anything you don't share stays private to you."
        />

        {error ? (
          <div className="mb-4">
            <Alert tone="negative" title="That didn't work">
              {error}
            </Alert>
          </div>
        ) : null}

        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Users className="size-4 text-brand" aria-hidden="true" />
                Start here
              </span>
            }
            description="Tell the other person who they're sharing with."
          />
          <PanelBody>
            <Field
              id="your-name"
              label="Your name"
              hint="Shown next to anything you share, so everyone knows who's who."
            >
              <Input
                placeholder="Alex"
                value={yourName}
                onChange={(event) => setYourName(event.target.value)}
              />
            </Field>
          </PanelBody>
        </Panel>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Panel>
            <PanelHeader title="Start a new one" description="You'll get a code to pass on." />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim()) createMutation.mutate();
              }}
            >
              <PanelBody>
                <Field id="household-name" label="Name it">
                  <Input
                    placeholder="Our place"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
              </PanelBody>
              <PanelFooter>
                <Button
                  type="submit"
                  variant="brand"
                  className="w-full"
                  loading={createMutation.isPending}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating…" : "Create household"}
                </Button>
              </PanelFooter>
            </form>
          </Panel>

          <Panel>
            <PanelHeader
              title="Or join with a code"
              description="Ask them for the code under Tools."
            />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (code.trim()) joinMutation.mutate();
              }}
            >
              <PanelBody>
                <Field id="join-code" label="Invite code">
                  <Input
                    placeholder="ABC123"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    className="num uppercase tracking-[0.18em]"
                  />
                </Field>
              </PanelBody>
              <PanelFooter>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  loading={joinMutation.isPending}
                  disabled={joinMutation.isPending}
                >
                  {joinMutation.isPending ? "Joining…" : "Join household"}
                </Button>
              </PanelFooter>
            </form>
          </Panel>
        </div>
      </div>
    );
  }

  // --- in a household ---
  const settlement = settleData?.settlement ?? null;
  const combined = settleData?.combined ?? null;
  const me = state.members.find((m) => m.role === "owner" && state.isOwner);

  return (
    <div className={page}>
      <PageHeader
        eyebrow="Household"
        title={state.household.name}
        description={
          state.members.length === 1 ? (
            "Just you so far — share the code below to add someone."
          ) : (
            <>
              <span className="num">{state.members.length}</span> people sharing.
            </>
          )
        }
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="negative" title="That didn't work">
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* join code */}
        <Panel>
          <PanelHeader
            title="Invite code"
            description="They sign up, then enter this under Tools."
          />
          <PanelBody>
            <div className="flex flex-wrap items-center gap-3">
              <p className="num figure text-[28px] tracking-[0.18em]">
                {state.household.join_code}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(state.household!.join_code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </PanelBody>
        </Panel>

        {/* members */}
        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Users className="size-4 text-brand" aria-hidden="true" />
                Who&apos;s in
              </span>
            }
          />
          <PanelBody>
            <ul className="divide-hairline">
              {state.members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">
                    {member.display_name?.trim() || `Member ${member.user_id.slice(0, 4)}`}
                  </span>
                  {member.role === "owner" ? <Badge tone="brand">owner</Badge> : null}
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      </div>

      {/* your display name */}
      <Panel className="mt-4">
        <PanelHeader title="Your name in this household" />
        <PanelBody>
          <Field id="rename" label="Shown next to what you share">
            <Input
              placeholder={me?.display_name ?? "Your name"}
              value={yourName}
              onChange={(event) => setYourName(event.target.value)}
            />
          </Field>
        </PanelBody>
        <PanelFooter>
          <Button
            type="button"
            variant="outline"
            loading={renameMutation.isPending}
            disabled={renameMutation.isPending || !yourName.trim()}
            onClick={() => renameMutation.mutate(yourName.trim())}
            className="w-full sm:w-auto"
          >
            Save name
          </Button>
        </PanelFooter>
      </Panel>

      {/* what everyone has logged (shared, whether split or not) */}
      {combined && combined.sharedCount > 0 ? (
        <Panel className="mt-4">
          <PanelHeader
            title="What everyone has shared"
            description={
              <>
                <span className="num">{combined.sharedCount}</span> shared{" "}
                {combined.sharedCount === 1 ? "entry" : "entries"}
                {combined.splitCount > 0 ? (
                  <>
                    , <span className="num">{combined.splitCount}</span> marked to split
                  </>
                ) : (
                  ", none marked to split"
                )}
                .
              </>
            }
          />
          <PanelBody>
            <ul className="divide-hairline">
              {combined.byMember.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">{member.name}</span>
                  <span className="shrink-0 text-right">
                    {member.moneyIn > 0 ? (
                      <>
                        <Money value={member.moneyIn} tone="positive" />
                        <span className="text-muted-foreground"> in · </span>
                      </>
                    ) : null}
                    <Money value={member.moneyOut} tone="negative" />
                    <span className="text-muted-foreground"> out</span>
                  </span>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      ) : null}

      {/* settlement — only entries marked "split it" */}
      {settlement && settlement.totalShared > 0 ? (
        <Panel className="mt-4">
          <PanelHeader title="Bills you're splitting" description="Only entries marked to split." />
          <PanelBody>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Metric
                label="Each person's share"
                value={<Money value={settlement.perPerson} />}
                emphasis="hero"
              />
              <Metric
                label="Total to split"
                value={<Money value={settlement.totalShared} />}
                emphasis="compact"
              />
            </div>

            <ul className="divide-hairline mt-5">
              {settlement.balances.map((balance) => (
                <li
                  key={balance.user_id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate">{balance.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground">
                      paid <Money value={balance.paid} />
                    </span>
                    {Math.abs(balance.balance) < 0.005 ? (
                      <Badge tone="positive">square</Badge>
                    ) : balance.balance > 0 ? (
                      <Badge tone="positive">
                        owed <Money value={Math.abs(balance.balance)} tone="positive" />
                      </Badge>
                    ) : (
                      <Badge tone="negative">
                        owes <Money value={Math.abs(balance.balance)} tone="negative" />
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </PanelBody>

          {settlement.transfers.length > 0 ? (
            <PanelFooter className="flex-col items-stretch gap-1.5 py-4">
              <p className="eyebrow">To square up</p>
              <ul className="space-y-1 text-sm font-medium">
                {settlement.transfers.map((transfer, index) => (
                  <li key={index}>
                    {transfer.fromName} pays {transfer.toName}{" "}
                    <Money value={transfer.amount} className="font-semibold" />
                  </li>
                ))}
              </ul>
            </PanelFooter>
          ) : (
            <PanelFooter>
              <p className="text-sm text-success">Everyone&apos;s square — nothing owed.</p>
            </PanelFooter>
          )}
        </Panel>
      ) : combined && combined.sharedCount > 0 ? (
        <div className="mt-4">
          <Alert tone="neutral" title="Nothing to settle up">
            Nothing is marked to split, so nobody owes anybody. Choose &ldquo;Split it&rdquo; when
            logging if you want an expense divided evenly.
          </Alert>
        </div>
      ) : (
        <div className="mt-4">
          <Alert tone="neutral" title="Nothing shared yet">
            When you log something, choose &ldquo;Share&rdquo; so the household can see it, or
            &ldquo;Split it&rdquo; to divide it evenly.
          </Alert>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="mt-5 w-full"
        loading={leaveMutation.isPending}
        disabled={leaveMutation.isPending}
        onClick={() => {
          if (
            window.confirm(
              "Leave this household? Anything you shared becomes private to you again.",
            )
          ) {
            leaveMutation.mutate();
          }
        }}
      >
        {leaveMutation.isPending ? "Leaving…" : "Leave household"}
      </Button>
    </div>
  );
}

// =========================================================================
// Product margins
// =========================================================================

export function MarginsSection() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(getProducts);
  const fetchEntries = useServerFn(getEntries);
  const upsert = useServerFn(saveProduct);
  const drop = useServerFn(removeProduct);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: entries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => fetchEntries() });

  const overhead = useMemo(() => averageMonthlyOverhead(entries), [entries]);

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products"] });

  const save = useMutation({
    mutationFn: (input: { name: string; unit_cost: number; sale_price: number }) =>
      upsert({ data: input }),
    onSuccess: () => {
      setName("");
      setCost("");
      setPrice("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div className={page}>
      <PageHeader
        eyebrow="Tools"
        title="What you actually keep"
        description="Put in what an item costs you and what you sell it for, and see the real profit on every sale."
      />

      <Panel>
        <PanelHeader
          title="Your items"
          description={
            overhead > 0 ? (
              <>
                Your usual monthly costs run about{" "}
                <Money value={overhead} className="font-medium text-foreground" />.
              </>
            ) : undefined
          }
        />
        <PanelBody>
          {isLoading ? (
            <SkeletonRows rows={2} />
          ) : products.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              No items yet — add your first one below.
            </p>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => {
                const m = productMargin(product, overhead > 0 ? overhead : null);
                const losing = m.grossPerUnit <= 0;
                return (
                  <li
                    key={product.id}
                    className="rounded-[var(--radius-12)] border border-border bg-surface-2 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{product.name}</p>
                        <p className="text-[12px] text-muted-foreground">
                          Costs <Money value={product.unit_cost} /> · sells for{" "}
                          <Money value={product.sale_price} />
                        </p>
                      </div>
                      <RemoveButton
                        label={`Remove ${product.name}`}
                        onClick={() => remove.mutate(product.id)}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div
                        className={`rounded-[var(--radius-10)] p-2.5 ${
                          losing ? "bg-danger-soft" : "bg-success-soft"
                        }`}
                      >
                        <Metric
                          label="You keep, each"
                          emphasis="compact"
                          tone={losing ? "negative" : "positive"}
                          value={
                            <Money
                              value={m.grossPerUnit}
                              signed
                              tone={losing ? "negative" : "positive"}
                            />
                          }
                        />
                      </div>
                      <div className="rounded-[var(--radius-10)] bg-surface-3 p-2.5">
                        <Metric
                          label="Margin"
                          emphasis="compact"
                          value={<span className="num">{Math.round(m.grossMarginPercent)}%</span>}
                        />
                      </div>
                    </div>

                    {losing ? (
                      <p className="mt-2 text-[12px] font-medium text-danger">
                        You&apos;re selling this for less than it costs you.
                      </p>
                    ) : m.unitsToCoverOverhead != null ? (
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        Sell about{" "}
                        <span className="num font-semibold text-foreground">
                          {m.unitsToCoverOverhead}
                        </span>{" "}
                        a month to cover your usual <Money value={overhead} /> of costs.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </PanelBody>
      </Panel>

      <Panel className="mt-4">
        <PanelHeader title="Add an item" />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const unitCost = Number(cost || 0);
            const salePrice = Number(price || 0);
            if (!name.trim() || !(salePrice > 0)) return;
            save.mutate({ name: name.trim(), unit_cost: unitCost, sale_price: salePrice });
          }}
        >
          <PanelBody className="space-y-4">
            <Field id="product-name" label="Item">
              <Input
                placeholder="Candle"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="product-cost" label="Costs you">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="4.00"
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                  className="num"
                />
              </Field>
              <Field id="product-price" label="You sell it for">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="10.00"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="num"
                />
              </Field>
            </div>
          </PanelBody>
          <PanelFooter>
            <Button
              type="submit"
              variant="brand"
              className="w-full sm:w-auto"
              loading={save.isPending}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save item"}
            </Button>
          </PanelFooter>
        </form>
      </Panel>
    </div>
  );
}

// =========================================================================
// Cash drawer
// =========================================================================

export function DrawerSection() {
  const queryClient = useQueryClient();
  const fetchCounts = useServerFn(getCashCounts);
  const fetchEntries = useServerFn(getEntries);
  const fetchSettings = useServerFn(getSettings);
  const upsert = useServerFn(saveCashCount);
  const drop = useServerFn(removeCashCount);

  const { data: counts = [], isLoading } = useQuery({
    queryKey: ["cashCounts"],
    queryFn: () => fetchCounts(),
  });
  const { data: entries = [] } = useQuery({ queryKey: ["entries"], queryFn: () => fetchEntries() });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [date, setDate] = useState(todayISO());
  const [counted, setCounted] = useState("");
  const [float, setFloat] = useState("");

  // Live preview of the expected amount, so the owner sees the gap before saving.
  const preview = useMemo(() => {
    const openingFloat = Number(float || settings?.opening_float || 0);
    return reconcileDrawer(entries, {
      date,
      counted: Number(counted || 0),
      openingFloat,
    });
  }, [entries, date, counted, float, settings?.opening_float]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cashCounts"] });

  const save = useMutation({
    mutationFn: (input: {
      count_date: string;
      counted_amount: number;
      opening_float: number;
      note: string | null;
    }) => upsert({ data: input }),
    onSuccess: () => {
      setCounted("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div className={page}>
      <PageHeader
        eyebrow="Tools"
        title="Cash drawer check"
        description="Count the till at the end of the day and see whether it matches what you logged."
      />

      <Panel>
        <PanelHeader title="Tonight's count" />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!counted.trim()) return;
            save.mutate({
              count_date: date,
              counted_amount: Number(counted || 0),
              opening_float: Number(float || settings?.opening_float || 0),
              note: null,
            });
          }}
        >
          <PanelBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="count-date" label="Day">
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="num"
                />
              </Field>
              <Field id="count-float" label="Starting float">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder={String(settings?.opening_float ?? 0)}
                  value={float}
                  onChange={(event) => setFloat(event.target.value)}
                  className="num"
                />
              </Field>
            </div>

            <Field id="count-amount" label="Counted in the drawer">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={counted}
                onChange={(event) => setCounted(event.target.value)}
                className="num"
              />
            </Field>

            <div className="rounded-[var(--radius-12)] border border-border bg-surface-2 p-4">
              <Metric
                label="Should be in the drawer"
                emphasis="hero"
                value={<Money value={preview.expected} />}
                hint={
                  <>
                    <Money value={preview.openingFloat} /> float +{" "}
                    <Money value={preview.cashIn} tone="positive" /> in −{" "}
                    <Money value={preview.cashOut} tone="negative" /> out
                  </>
                }
              />
            </div>

            {counted.trim() ? (
              preview.status === "balanced" ? (
                <Alert tone="positive" title="Balanced — nice.">
                  What you counted matches what you logged.
                </Alert>
              ) : preview.status === "over" ? (
                <Alert tone="neutral" title="More than expected">
                  There&apos;s <Money value={Math.abs(preview.difference)} /> more in the drawer
                  than your entries account for.
                </Alert>
              ) : (
                <Alert tone="negative" title="Short">
                  The drawer is <Money value={Math.abs(preview.difference)} tone="negative" /> short
                  of what you logged.
                </Alert>
              )
            ) : null}
          </PanelBody>

          <PanelFooter>
            <Button
              type="submit"
              variant="brand"
              className="w-full sm:w-auto"
              loading={save.isPending}
              disabled={save.isPending || !counted.trim()}
            >
              {save.isPending ? "Saving…" : "Save count"}
            </Button>
          </PanelFooter>
        </form>
      </Panel>

      {isLoading || counts.length > 0 ? (
        <Panel className="mt-4">
          <PanelHeader title="Recent counts" description="Your last seven days of counting up." />
          <PanelBody>
            {isLoading ? (
              <SkeletonRows rows={3} />
            ) : (
              <ul className="divide-hairline">
                {counts.slice(0, 7).map((count) => (
                  <li
                    key={count.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <span className="num font-medium">{count.count_date}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">
                        <Money value={count.counted_amount} /> counted ·{" "}
                        <Money value={count.expected_amount} /> expected
                      </span>
                      {Math.abs(count.difference) < 0.005 ? (
                        <Badge tone="positive">square</Badge>
                      ) : (
                        <Badge tone={count.difference > 0 ? "neutral" : "negative"}>
                          <Money value={count.difference} signed />
                        </Badge>
                      )}
                      <RemoveButton
                        label={`Remove count for ${count.count_date}`}
                        onClick={() => remove.mutate(count.id)}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </PanelBody>
        </Panel>
      ) : null}
    </div>
  );
}

// =========================================================================
// Settings (tax rate + default float)
// =========================================================================

export function SettingsSection() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const save = useServerFn(putSettings);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [rate, setRate] = useState<string | null>(null);
  const [float, setFloat] = useState<string | null>(null);

  const rateValue = rate ?? String(settings?.tax_rate_percent ?? "");
  const floatValue = float ?? String(settings?.opening_float ?? "");

  const mutate = useMutation({
    mutationFn: (input: { tax_rate_percent: number; opening_float: number }) =>
      save({ data: input }),
    onSuccess: () => {
      setRate(null);
      setFloat(null);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  return (
    // Sits under the tax card on its page, so it stays a panel rather than a
    // second page heading.
    <Panel className="mt-6">
      <PanelHeader
        title="Settings"
        description="Set what share of income to hold back for tax, and how much cash you normally start the day with."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutate.mutate({
            tax_rate_percent: Number(rateValue || 0),
            opening_float: Number(floatValue || 0),
          });
        }}
      >
        <PanelBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="tax-rate" label="Hold back for tax (%)">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="1"
                placeholder="25"
                value={rateValue}
                onChange={(event) => setRate(event.target.value)}
                className="num"
              />
            </Field>
            <Field id="default-float" label="Usual starting float">
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="50"
                value={floatValue}
                onChange={(event) => setFloat(event.target.value)}
                className="num"
              />
            </Field>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Not tax advice — it just holds back a share of what you log so the bill isn&apos;t a
            surprise. Check the rate with your accountant.
          </p>
        </PanelBody>
        <PanelFooter>
          <Button
            type="submit"
            variant="brand"
            className="w-full sm:w-auto"
            loading={mutate.isPending}
            disabled={mutate.isPending}
          >
            {mutate.isPending ? "Saving…" : "Save settings"}
          </Button>
        </PanelFooter>
      </form>
    </Panel>
  );
}

// =========================================================================
// App lock
// =========================================================================

export function LockSection() {
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getSettings);
  const setLock = useServerFn(setAppLock);
  const clearLock = useServerFn(removeAppLock);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => fetchSettings() });

  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [timeout, setTimeoutMinutes] = useState("5");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["settings"] });

  const save = useMutation({
    mutationFn: () => setLock({ data: { pin, timeout_minutes: Number(timeout || 0) } }),
    onSuccess: () => {
      setPin("");
      setConfirm("");
      setError(null);
      setDone("Lock is on. You'll be asked for this PIN when you come back.");
      setTimeout(() => setDone(null), 4000);
      refresh();
    },
    onError: (err: Error) => setError(err.message),
  });

  const turnOff = useMutation({
    mutationFn: () => clearLock({}),
    onSuccess: () => {
      setError(null);
      setDone("Lock turned off.");
      setTimeout(() => setDone(null), 3000);
      refresh();
    },
    onError: (err: Error) => setError(err.message),
  });

  const enabled = Boolean(settings?.lock_enabled);

  return (
    <div className={page}>
      <PageHeader
        eyebrow="Tools"
        title="Lock this app"
        description="Hide your books behind a PIN, so someone holding your unlocked phone can't read them."
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="negative" title="That didn't work">
            {error}
          </Alert>
        </div>
      ) : null}
      {done ? (
        <div className="mb-4">
          <Alert tone="positive">{done}</Alert>
        </div>
      ) : null}

      {enabled ? (
        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Lock className="size-4 text-brand" aria-hidden="true" />
                Lock this app
              </span>
            }
            action={<Badge tone="positive">On</Badge>}
          />
          <PanelBody>
            <p className="text-sm text-muted-foreground">
              {settings?.lock_timeout_minutes === 0 ? (
                "Asks for your PIN every time you open the app."
              ) : (
                <>
                  Asks again after{" "}
                  <span className="num font-medium text-foreground">
                    {settings?.lock_timeout_minutes}
                  </span>{" "}
                  minutes away.
                </>
              )}
            </p>
          </PanelBody>
          <PanelFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              loading={turnOff.isPending}
              disabled={turnOff.isPending}
              onClick={() => turnOff.mutate()}
            >
              {turnOff.isPending ? "Turning off…" : "Turn off lock"}
            </Button>
          </PanelFooter>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Lock className="size-4 text-brand" aria-hidden="true" />
                Choose a PIN
              </span>
            }
            description="Four to eight numbers. You'll type it when you come back to the app."
            action={<Badge tone="neutral">Off</Badge>}
          />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const problem = validatePin(pin);
              if (problem) {
                setError(problem);
                return;
              }
              if (pin !== confirm) {
                setError("Those two PINs don't match.");
                return;
              }
              save.mutate();
            }}
          >
            <PanelBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="lock-pin" label="New PIN" hint="4 to 8 numbers.">
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    autoComplete="new-password"
                    placeholder="••••"
                    value={pin}
                    invalid={Boolean(error)}
                    onChange={(event) => {
                      setPin(event.target.value.replace(/\D/g, ""));
                      setError(null);
                    }}
                    className="num h-12 text-lg tracking-[0.3em] md:h-12 md:text-lg"
                  />
                </Field>
                <Field id="lock-confirm" label="Type it again">
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={8}
                    autoComplete="new-password"
                    placeholder="••••"
                    value={confirm}
                    invalid={Boolean(error)}
                    onChange={(event) => {
                      setConfirm(event.target.value.replace(/\D/g, ""));
                      setError(null);
                    }}
                    className="num h-12 text-lg tracking-[0.3em] md:h-12 md:text-lg"
                  />
                </Field>
              </div>

              <Field id="lock-timeout" label="Ask again after">
                <Select value={timeout} onChange={(event) => setTimeoutMinutes(event.target.value)}>
                  <option value="0">Every time I open it</option>
                  <option value="1">1 minute away</option>
                  <option value="5">5 minutes away</option>
                  <option value="15">15 minutes away</option>
                  <option value="60">1 hour away</option>
                </Select>
              </Field>
            </PanelBody>
            <PanelFooter>
              <Button
                type="submit"
                variant="brand"
                className="w-full sm:w-auto"
                loading={save.isPending}
                disabled={save.isPending}
              >
                {save.isPending ? "Saving…" : "Turn on lock"}
              </Button>
            </PanelFooter>
          </form>
        </Panel>
      )}

      <p className="mt-4 px-1 text-[12px] leading-relaxed text-muted-foreground">
        This hides the app on your device. Your account is already protected by your password, and
        only you can read your data — the PIN is a convenience lock on top of that, not a
        replacement for it. Forgotten it? Sign out and back in, then set a new one.
      </p>
    </div>
  );
}
