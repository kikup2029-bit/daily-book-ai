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
import { useI18n } from "@/lib/i18n";
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
import { pinProblemKey, readPinProblem, validatePin } from "@/lib/pin";
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
  const { t, money } = useI18n();
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
          eyebrow={t("tools.eyebrow")}
          title={t("tools.householdTitle")}
          description={t("tools.householdBlurb")}
        />

        {error ? (
          <div className="mb-4">
            <Alert tone="negative" title={t("tools.didntWork")}>
              {error}
            </Alert>
          </div>
        ) : null}

        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Users className="size-4 text-brand" aria-hidden="true" />
                {t("tools.householdStartHere")}
              </span>
            }
            description={t("tools.householdStartHereBlurb")}
          />
          <PanelBody>
            <Field
              id="your-name"
              label={t("tools.householdYourName")}
              hint={t("tools.householdYourNameHint")}
            >
              <Input
                placeholder={t("tools.householdYourNamePlaceholder")}
                value={yourName}
                onChange={(event) => setYourName(event.target.value)}
              />
            </Field>
          </PanelBody>
        </Panel>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Panel>
            <PanelHeader
              title={t("tools.householdCreateTitle")}
              description={t("tools.householdCreateBlurb")}
            />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim()) createMutation.mutate();
              }}
            >
              <PanelBody>
                <Field id="household-name" label={t("tools.householdNameIt")}>
                  <Input
                    placeholder={t("tools.householdNamePlaceholder")}
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
                  {createMutation.isPending
                    ? t("tools.householdCreating")
                    : t("tools.householdCreate")}
                </Button>
              </PanelFooter>
            </form>
          </Panel>

          <Panel>
            <PanelHeader
              title={t("tools.householdJoinTitle")}
              description={t("tools.householdJoinBlurb")}
            />
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (code.trim()) joinMutation.mutate();
              }}
            >
              <PanelBody>
                <Field id="join-code" label={t("tools.householdInviteCode")}>
                  <Input
                    placeholder={t("tools.householdCodePlaceholder")}
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
                  {joinMutation.isPending ? t("tools.householdJoining") : t("tools.householdJoin")}
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
        eyebrow={t("tools.householdEyebrow")}
        title={state.household.name}
        description={
          state.members.length === 1
            ? t("tools.householdJustYou")
            : t("tools.householdPeopleSharing", { count: state.members.length })
        }
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="negative" title={t("tools.didntWork")}>
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* join code */}
        <Panel>
          <PanelHeader
            title={t("tools.householdInviteCode")}
            description={t("tools.householdInviteCodeBlurb")}
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
                {copied ? t("tools.copied") : t("tools.copy")}
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
                {t("tools.householdWhosIn")}
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
                    {member.display_name?.trim() ||
                      t("tools.householdMemberFallback", { id: member.user_id.slice(0, 4) })}
                  </span>
                  {member.role === "owner" ? (
                    <Badge tone="brand">{t("tools.householdOwner")}</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      </div>

      {/* your display name */}
      <Panel className="mt-4">
        <PanelHeader title={t("tools.householdYourNameTitle")} />
        <PanelBody>
          <Field id="rename" label={t("tools.householdShownNextTo")}>
            <Input
              placeholder={me?.display_name ?? t("tools.householdYourName")}
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
            {t("tools.householdSaveName")}
          </Button>
        </PanelFooter>
      </Panel>

      {/* what everyone has logged (shared, whether split or not) */}
      {combined && combined.sharedCount > 0 ? (
        <Panel className="mt-4">
          <PanelHeader
            title={t("tools.householdEveryoneShared")}
            description={
              combined.splitCount > 0
                ? t("tools.householdSharedWithSplit", {
                    count: combined.sharedCount,
                    split: combined.splitCount,
                  })
                : t("tools.householdSharedNoSplit", { count: combined.sharedCount })
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
                        <span className="num text-success">
                          {t("tools.amountIn", { amount: money(member.moneyIn) })}
                        </span>
                        <span className="text-muted-foreground"> · </span>
                      </>
                    ) : null}
                    <span className="num text-danger">
                      {t("tools.amountOut", { amount: money(member.moneyOut) })}
                    </span>
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
          <PanelHeader
            title={t("tools.householdSplittingTitle")}
            description={t("tools.householdSplittingBlurb")}
          />
          <PanelBody>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Metric
                label={t("tools.householdEachShare")}
                value={<Money value={settlement.perPerson} />}
                emphasis="hero"
              />
              <Metric
                label={t("tools.householdTotalToSplit")}
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
                      {t("tools.householdPaid", { amount: money(balance.paid) })}
                    </span>
                    {Math.abs(balance.balance) < 0.005 ? (
                      <Badge tone="positive">{t("tools.square")}</Badge>
                    ) : balance.balance > 0 ? (
                      <Badge tone="positive">
                        {t("tools.householdOwed", { amount: money(Math.abs(balance.balance)) })}
                      </Badge>
                    ) : (
                      <Badge tone="negative">
                        {t("tools.householdOwes", { amount: money(Math.abs(balance.balance)) })}
                      </Badge>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </PanelBody>

          {settlement.transfers.length > 0 ? (
            <PanelFooter className="flex-col items-stretch gap-1.5 py-4">
              <p className="eyebrow">{t("tools.householdToSquareUp")}</p>
              <ul className="space-y-1 text-sm font-medium">
                {settlement.transfers.map((transfer, index) => (
                  <li key={index}>
                    {t("tools.householdTransfer", {
                      from: transfer.fromName,
                      to: transfer.toName,
                      amount: money(transfer.amount),
                    })}
                  </li>
                ))}
              </ul>
            </PanelFooter>
          ) : (
            <PanelFooter>
              <p className="text-sm text-success">{t("tools.householdAllSquare")}</p>
            </PanelFooter>
          )}
        </Panel>
      ) : combined && combined.sharedCount > 0 ? (
        <div className="mt-4">
          <Alert tone="neutral" title={t("tools.householdNothingToSettle")}>
            {t("tools.householdNothingToSettleBody")}
          </Alert>
        </div>
      ) : (
        <div className="mt-4">
          <Alert tone="neutral" title={t("tools.householdNothingShared")}>
            {t("tools.householdNothingSharedBody")}
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
          if (window.confirm(t("tools.householdLeaveConfirm"))) {
            leaveMutation.mutate();
          }
        }}
      >
        {leaveMutation.isPending ? t("tools.householdLeaving") : t("tools.householdLeave")}
      </Button>
    </div>
  );
}

// =========================================================================
// Product margins
// =========================================================================

export function MarginsSection() {
  const { t, money } = useI18n();
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
        eyebrow={t("tools.eyebrow")}
        title={t("tools.marginsTitle")}
        description={t("tools.marginsBlurb")}
      />

      <Panel>
        <PanelHeader
          title={t("tools.marginsYourItems")}
          description={
            overhead > 0 ? t("tools.marginsOverhead", { amount: money(overhead) }) : undefined
          }
        />
        <PanelBody>
          {isLoading ? (
            <SkeletonRows rows={2} />
          ) : products.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">{t("tools.marginsNoItems")}</p>
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
                          {t("tools.marginsCostSell", {
                            cost: money(product.unit_cost),
                            price: money(product.sale_price),
                          })}
                        </p>
                      </div>
                      <RemoveButton
                        label={t("tools.marginsRemoveItem", { name: product.name })}
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
                          label={t("tools.marginsYouKeep")}
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
                          label={t("tools.marginsMargin")}
                          emphasis="compact"
                          value={
                            <span className="num">
                              {t("tools.marginsPercent", {
                                percent: Math.round(m.grossMarginPercent),
                              })}
                            </span>
                          }
                        />
                      </div>
                    </div>

                    {losing ? (
                      <p className="mt-2 text-[12px] font-medium text-danger">
                        {t("tools.marginsLosing")}
                      </p>
                    ) : m.unitsToCoverOverhead != null ? (
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        {t("tools.marginsUnitsToCover", {
                          count: m.unitsToCoverOverhead,
                          amount: money(overhead),
                        })}
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
        <PanelHeader title={t("tools.marginsAddItem")} />
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
            <Field id="product-name" label={t("tools.marginsItem")}>
              <Input
                placeholder={t("tools.marginsItemPlaceholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="product-cost" label={t("tools.marginsCostsYou")}>
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
              <Field id="product-price" label={t("tools.marginsSellFor")}>
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
              {save.isPending ? t("common.saving") : t("tools.marginsSaveItem")}
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
  const { t, money } = useI18n();
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
        eyebrow={t("tools.eyebrow")}
        title={t("tools.drawerTitle")}
        description={t("tools.drawerBlurb")}
      />

      <Panel>
        <PanelHeader title={t("tools.drawerTonightsCount")} />
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
              <Field id="count-date" label={t("tools.drawerDay")}>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="num"
                />
              </Field>
              <Field id="count-float" label={t("tools.drawerStartingFloat")}>
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

            <Field id="count-amount" label={t("tools.drawerCounted")}>
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
                label={t("tools.drawerShouldBe")}
                emphasis="hero"
                value={<Money value={preview.expected} />}
                hint={t("tools.drawerBreakdown", {
                  float: money(preview.openingFloat),
                  moneyIn: money(preview.cashIn),
                  moneyOut: money(preview.cashOut),
                })}
              />
            </div>

            {counted.trim() ? (
              preview.status === "balanced" ? (
                <Alert tone="positive" title={t("tools.drawerBalanced")}>
                  {t("tools.drawerBalancedBody")}
                </Alert>
              ) : preview.status === "over" ? (
                <Alert tone="neutral" title={t("tools.drawerOver")}>
                  {t("tools.drawerOverBody", { amount: money(Math.abs(preview.difference)) })}
                </Alert>
              ) : (
                <Alert tone="negative" title={t("tools.drawerShort")}>
                  {t("tools.drawerShortBody", { amount: money(Math.abs(preview.difference)) })}
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
              {save.isPending ? t("common.saving") : t("tools.drawerSaveCount")}
            </Button>
          </PanelFooter>
        </form>
      </Panel>

      {isLoading || counts.length > 0 ? (
        <Panel className="mt-4">
          <PanelHeader
            title={t("tools.drawerRecentCounts")}
            description={t("tools.drawerRecentBlurb")}
          />
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
                        {t("tools.drawerCountedExpected", {
                          counted: money(count.counted_amount),
                          expected: money(count.expected_amount),
                        })}
                      </span>
                      {Math.abs(count.difference) < 0.005 ? (
                        <Badge tone="positive">{t("tools.square")}</Badge>
                      ) : (
                        <Badge tone={count.difference > 0 ? "neutral" : "negative"}>
                          <Money value={count.difference} signed />
                        </Badge>
                      )}
                      <RemoveButton
                        label={t("tools.drawerRemoveCount", { date: count.count_date })}
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
  const { t } = useI18n();
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
      <PanelHeader title={t("tools.settingsTitle")} description={t("tools.settingsBlurb")} />
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
            <Field id="tax-rate" label={t("tools.settingsTaxRate")}>
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
            <Field id="default-float" label={t("tools.settingsUsualFloat")}>
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
            {t("tools.settingsTaxNote")}
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
            {mutate.isPending ? t("common.saving") : t("tools.settingsSave")}
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
  const { t } = useI18n();
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
      setDone(t("tools.lockOnMessage"));
      setTimeout(() => setDone(null), 4000);
      refresh();
    },
    onError: (err: Error) => {
      // The server rejects a bad PIN with a code rather than a sentence, so
      // that it lands here in the reader's language and not in English.
      const reason = readPinProblem(err.message);
      setError(reason ? t(pinProblemKey(reason)) : err.message);
    },
  });

  const turnOff = useMutation({
    mutationFn: () => clearLock({}),
    onSuccess: () => {
      setError(null);
      setDone(t("tools.lockOffMessage"));
      setTimeout(() => setDone(null), 3000);
      refresh();
    },
    onError: (err: Error) => setError(err.message),
  });

  const enabled = Boolean(settings?.lock_enabled);

  /** How long the app may sit idle before it asks again. Text lives in the dictionary. */
  const timeoutOptions = [
    { value: "0", label: t("tools.lockTimeoutAlways") },
    { value: "1", label: t("tools.lockTimeoutMinutes", { count: 1 }) },
    { value: "5", label: t("tools.lockTimeoutMinutes", { count: 5 }) },
    { value: "15", label: t("tools.lockTimeoutMinutes", { count: 15 }) },
    { value: "60", label: t("tools.lockTimeoutHours", { count: 1 }) },
  ];

  return (
    <div className={page}>
      <PageHeader
        eyebrow={t("tools.eyebrow")}
        title={t("tools.lockTitle")}
        description={t("tools.lockBlurb")}
      />

      {error ? (
        <div className="mb-4">
          <Alert tone="negative" title={t("tools.didntWork")}>
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
                {t("tools.lockTitle")}
              </span>
            }
            action={<Badge tone="positive">{t("tools.lockOn")}</Badge>}
          />
          <PanelBody>
            <p className="text-sm text-muted-foreground">
              {settings?.lock_timeout_minutes === 0
                ? t("tools.lockEveryTime")
                : t("tools.lockAsksAfter", { count: settings?.lock_timeout_minutes ?? 0 })}
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
              {turnOff.isPending ? t("tools.lockTurningOff") : t("tools.lockTurnOff")}
            </Button>
          </PanelFooter>
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Lock className="size-4 text-brand" aria-hidden="true" />
                {t("tools.lockChoosePin")}
              </span>
            }
            description={t("tools.lockChoosePinBlurb")}
            action={<Badge tone="neutral">{t("tools.lockOff")}</Badge>}
          />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const check = validatePin(pin);
              if (!check.ok) {
                setError(t(pinProblemKey(check.reason)));
                return;
              }
              if (pin !== confirm) {
                setError(t("tools.lockPinMismatch"));
                return;
              }
              save.mutate();
            }}
          >
            <PanelBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="lock-pin" label={t("tools.lockNewPin")} hint={t("tools.lockPinHint")}>
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
                <Field id="lock-confirm" label={t("tools.lockConfirmPin")}>
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

              <Field id="lock-timeout" label={t("tools.lockAskAgainAfter")}>
                <Select value={timeout} onChange={(event) => setTimeoutMinutes(event.target.value)}>
                  {timeoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                {save.isPending ? t("common.saving") : t("tools.lockTurnOn")}
              </Button>
            </PanelFooter>
          </form>
        </Panel>
      )}

      <p className="mt-4 px-1 text-[12px] leading-relaxed text-muted-foreground">
        {t("tools.lockFootnote")}
      </p>
    </div>
  );
}
