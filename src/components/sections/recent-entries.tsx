/**
 * Recent entries.
 *
 * The list people look at most, so it's built for scanning rather than for
 * completeness: a marker, a name, the amount, and everything else demoted to a
 * quiet second line. Secondary actions live behind one overflow menu instead of
 * three permanent icons per row — with a dozen rows on screen, permanent icons
 * are three dozen competing targets and none of them are labelled.
 */

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  Car,
  CreditCard,
  Home,
  MoreHorizontal,
  Receipt,
  ShoppingBasket,
  Trash2,
  Users,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";

import { Badge, Money, SkeletonRows } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { EmptyState, SampleRows } from "@/components/empty-state";
import { ReceiptThumb } from "@/components/receipt-controls";
import { cn } from "@/lib/utils";
import {
  nextShareMode,
  readableDate,
  sharingLabel,
  signedAmount,
  tidyLabel,
} from "@/lib/entry-format";

export type RecentEntry = {
  id: string;
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant: string | null;
  receipt_path: string | null;
  household_id: string | null;
  is_split: boolean;
};

/** A marker that reads at a glance, chosen from whatever the entry is about. */
const CATEGORY_ICONS: Array<{ match: RegExp; icon: typeof Receipt }> = [
  { match: /groc|food|market|superm/i, icon: ShoppingBasket },
  { match: /rent|mortgage|hous/i, icon: Home },
  { match: /fuel|petrol|gas|car|transp|travel/i, icon: Car },
  { match: /meal|lunch|dinner|coffee|caf|restaur/i, icon: Utensils },
  { match: /power|electric|water|util|internet|phone/i, icon: Zap },
  { match: /supply|supplies|tool|repair|maint/i, icon: Wrench },
  { match: /card|bank|fee|subscript/i, icon: CreditCard },
];

function iconFor(entry: RecentEntry) {
  if (entry.amount_in > 0) return ArrowDownLeft;
  const text = `${entry.spent_on ?? ""} ${entry.merchant ?? ""}`;
  return CATEGORY_ICONS.find((row) => row.match.test(text))?.icon ?? ArrowUpRight;
}

/* ------------------------------------------------------------------ row */

function EntryRow({
  entry,
  canShare,
  busy,
  onToggleShare,
  onDelete,
  onViewReceipt,
}: {
  entry: RecentEntry;
  canShare: boolean;
  busy: boolean;
  onToggleShare: () => void;
  onDelete: () => void;
  onViewReceipt: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const Icon = iconFor(entry);

  const isIncome = entry.amount_in > 0;
  const amount = signedAmount(entry);
  const title =
    tidyLabel(entry.spent_on) ??
    tidyLabel(entry.merchant) ??
    (isIncome ? "Money in" : "Uncategorised");
  const where = tidyLabel(entry.merchant);
  const sharing = sharingLabel(entry);

  return (
    <li
      className={cn(
        // 68px on desktop: compact enough that six rows scan as one block,
        // tall enough for two lines of text without crowding.
        "group relative grid min-h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-3 sm:gap-x-4 sm:px-4",
        "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]",
        "hover:bg-accent/60 focus-within:bg-accent/60",
        menuOpen && "bg-accent/60",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-10)]",
          isIncome ? "bg-success-soft text-success" : "bg-surface-2 text-muted-foreground",
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0">
        {/* Name and amount share the first line on a phone, where a separate
            amount column would squeeze the name to nothing. */}
        <span className="flex items-baseline justify-between gap-3 sm:block">
          {/* min-w-0 is what makes truncate work: a flex child defaults to
              min-width:auto, so without it a long name refuses to shrink and
              shoves the amount off the end of the row. */}
          <span className="min-w-0 truncate text-[14.5px] font-medium leading-tight">{title}</span>
          <Money
            value={amount}
            signed
            className="shrink-0 text-[14.5px] font-semibold tabular-nums sm:hidden"
          />
        </span>

        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
          <span className="num whitespace-nowrap tracking-normal">
            {readableDate(entry.entry_date)}
          </span>
          {where && where !== title ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="min-w-0 max-w-[14rem] truncate">{where}</span>
            </>
          ) : null}
          {sharing ? (
            <Badge tone="brand" className="px-1.5 py-0 text-[10.5px]">
              <Users className="size-2.5" aria-hidden="true" />
              {sharing}
            </Badge>
          ) : null}
          {entry.receipt_path ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Receipt className="size-3" aria-hidden="true" />
              <span className="sr-only">Has a receipt</span>
            </span>
          ) : null}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1">
        <Money
          value={amount}
          signed
          className="hidden text-[15px] font-semibold tabular-nums sm:inline"
        />

        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${title}`}
              title="More actions"
              disabled={busy}
              className={cn(
                "flex size-11 items-center justify-center rounded-[var(--radius-8)] text-muted-foreground sm:size-9",
                "transition-[background-color,color,opacity] duration-[var(--dur-fast)] ease-[var(--ease)]",
                "hover:bg-surface-2 hover:text-foreground",
                "focus-visible:opacity-100 disabled:opacity-40",
                // Quiet until you go looking for it, but always there on touch,
                // where there's no hover to reveal it.
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
                menuOpen && "sm:opacity-100",
              )}
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="floating pop z-50 min-w-[13rem] p-1.5"
            >
              <DropdownMenu.Item
                onSelect={onViewReceipt}
                className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-8)] px-2.5 py-2 text-[13px] outline-none data-[highlighted]:bg-accent"
              >
                <Camera className="size-4 text-muted-foreground" aria-hidden="true" />
                {entry.receipt_path ? "View receipt" : "Add a receipt"}
              </DropdownMenu.Item>

              {canShare ? (
                <DropdownMenu.Item
                  onSelect={onToggleShare}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-8)] px-2.5 py-2 text-[13px] outline-none data-[highlighted]:bg-accent"
                >
                  <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                  {nextShareMode(entry).label}
                </DropdownMenu.Item>
              ) : null}

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                onSelect={(event) => {
                  // Keep the menu logic out of it: confirmation happens inline
                  // on the row, where you can still see what you're deleting.
                  event.preventDefault();
                  setMenuOpen(false);
                  setConfirming(true);
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-8)] px-2.5 py-2 text-[13px] text-danger outline-none data-[highlighted]:bg-danger-soft"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete entry
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </span>

      {confirming ? (
        <div
          role="alertdialog"
          aria-label={`Delete ${title}?`}
          className="pop col-span-3 mt-2 flex flex-wrap items-center gap-2 rounded-[var(--radius-10)] bg-danger-soft px-3 py-2.5"
        >
          <p className="min-w-0 flex-1 text-[13px] text-danger">
            Delete this entry? This can&apos;t be undone.
          </p>
          <Button
            size="sm"
            variant="destructive"
            loading={busy}
            onClick={() => {
              onDelete();
              setConfirming(false);
            }}
          >
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} autoFocus>
            Keep it
          </Button>
        </div>
      ) : null}
    </li>
  );
}

/* --------------------------------------------------------------- section */

export function RecentEntries({
  entries,
  isLoading,
  error,
  canShare,
  busy,
  onToggleShare,
  onDelete,
  onViewReceipt,
  limit = 6,
}: {
  entries: RecentEntry[];
  isLoading: boolean;
  error?: Error | null;
  canShare: boolean;
  busy: boolean;
  onToggleShare: (entry: RecentEntry) => void;
  onDelete: (entry: RecentEntry) => void;
  onViewReceipt: (entry: RecentEntry) => void;
  limit?: number;
}) {
  const shown = useMemo(() => entries.slice(0, limit), [entries, limit]);
  const [openReceipt, setOpenReceipt] = useState<RecentEntry | null>(null);

  return (
    <section aria-labelledby="recent-entries-heading" className="panel overflow-hidden">
      <header className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 id="recent-entries-heading" className="text-[15px] font-semibold leading-tight">
              Recent entries
            </h2>
            {!isLoading && entries.length > 0 ? (
              <Badge tone="neutral" className="px-1.5 py-0">
                <span className="num">{entries.length}</span>
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            Newest first. Tap the menu on a row to change or remove it.
          </p>
        </div>

        {entries.length > 0 ? (
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link to="/entries">View all</Link>
          </Button>
        ) : null}
      </header>

      {error ? (
        <div className="px-4 py-6 sm:px-5">
          <p role="alert" className="text-sm text-danger">
            Couldn&apos;t load your entries. {error.message}
          </p>
        </div>
      ) : isLoading ? (
        <div className="px-4 py-3 sm:px-5">
          <SkeletonRows rows={4} />
        </div>
      ) : entries.length === 0 ? (
        <div className="px-4 sm:px-5">
          <EmptyState
            title="Nothing logged yet"
            blurb="Add what came in and what went out, and it appears here straight away."
            sample={<SampleRows rows={3} />}
          />
        </div>
      ) : (
        <>
          <ul className="divide-hairline">
            {shown.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                canShare={canShare}
                busy={busy}
                onToggleShare={() => onToggleShare(entry)}
                onDelete={() => onDelete(entry)}
                onViewReceipt={() => {
                  if (entry.receipt_path) setOpenReceipt(entry);
                  else onViewReceipt(entry);
                }}
              />
            ))}
          </ul>

          {entries.length > shown.length ? (
            <div className="border-t px-4 py-3 text-center sm:px-5">
              <Link
                to="/entries"
                className="text-[13px] font-medium text-brand underline-offset-4 hover:underline"
              >
                <span className="num">{entries.length - shown.length}</span> more — see everything
              </Link>
            </div>
          ) : null}
        </>
      )}

      {openReceipt?.receipt_path ? (
        <div className="border-t bg-surface-2 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <ReceiptThumb path={openReceipt.receipt_path} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">
                Receipt for {tidyLabel(openReceipt.spent_on) ?? "this entry"}
              </p>
              <p className="num mt-0.5 text-[12px] text-muted-foreground">
                {readableDate(openReceipt.entry_date)}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpenReceipt(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
