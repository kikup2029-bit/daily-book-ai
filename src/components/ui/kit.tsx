/**
 * The shared vocabulary of the app.
 *
 * Every page is assembled from these, so spacing, weight and colour stay
 * consistent without anyone having to remember the values. If a page needs
 * something that isn't here, it belongs here rather than as one-off markup.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ money */

const formatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  // Guard against NaN reaching the screen as "$NaN".
  return formatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Money with its direction shown.
 *
 * The sign carries the meaning, not the colour: someone who can't distinguish
 * green from red still reads +$40.00 and −$40.00 correctly, and so does a
 * printed statement.
 */
export function Money({
  value,
  signed = false,
  tone,
  className,
}: {
  value: number;
  /** Prefix + or − for entries where direction matters. */
  signed?: boolean;
  /** Override the colour; by default it follows the sign. */
  tone?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  const resolved = tone ?? (signed ? (value >= 0 ? "positive" : "negative") : "neutral");
  const text = signed
    ? `${value >= 0 ? "+" : "−"}${formatMoney(Math.abs(value))}`
    : formatMoney(value);

  return (
    <span
      className={cn(
        "num",
        resolved === "positive" && "text-success",
        resolved === "negative" && "text-danger",
        className,
      )}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------ page header */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4 pb-6", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-[26px] leading-tight sm:text-[30px]">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ panel */

export function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={cn("panel", className)} {...props}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pb-3 pt-4", className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold leading-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PanelBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}

export function PanelFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2 border-t px-5 py-3", className)}>{children}</div>
  );
}

/* ----------------------------------------------------------------- metric */

/**
 * One number that matters. `emphasis` decides how loud — only one metric on a
 * screen should be "hero", or nothing stands out.
 */
export function Metric({
  label,
  value,
  hint,
  tone = "neutral",
  emphasis = "normal",
  loading = false,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "neutral" | "positive" | "negative";
  emphasis?: "hero" | "normal" | "compact";
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) {
  const size =
    emphasis === "hero"
      ? "text-[40px] sm:text-[52px]"
      : emphasis === "compact"
        ? "text-[20px]"
        : "text-[28px]";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-1.5">
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        <p className="eyebrow">{label}</p>
      </div>
      {loading ? (
        <span
          className={cn("skeleton mt-2 block", emphasis === "hero" ? "h-12 w-56" : "h-7 w-28")}
          aria-hidden="true"
        />
      ) : (
        <p
          className={cn(
            "figure mt-2 truncate",
            size,
            tone === "positive" && "text-success",
            tone === "negative" && "text-danger",
          )}
        >
          {value}
        </p>
      )}
      {hint && !loading ? <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ badge */

const badgeTones = {
  neutral: "bg-secondary text-secondary-foreground",
  brand: "bg-brand-soft text-foreground border border-brand-border",
  positive: "bg-success-soft text-success",
  negative: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof badgeTones;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-8)] px-2 py-0.5 text-[11px] font-semibold",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ forms */

/**
 * Label, control, hint and error in one place.
 *
 * The error is tied to the input with aria-describedby, so a screen reader
 * announces what's wrong instead of just "invalid".
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-[13px] font-medium text-foreground">
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            "aria-describedby": describedBy,
          })
        : children}
      {hint && !error ? (
        <p id={hintId} className="text-[12px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-[12px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius-10)] border border-input bg-surface-1 pl-3 pr-9",
          "text-base md:h-10 md:text-sm",
          "text-foreground transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)]",
          "hover:border-border-strong",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  ),
);
Select.displayName = "Select";

/**
 * A small set of mutually exclusive choices, as real radio semantics so
 * arrow keys work and a screen reader announces "2 of 3".
 */
export function Segmented<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn(
        "inline-flex rounded-[var(--radius-10)] border border-border bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[var(--radius-8)] px-3 py-1.5 text-[13px] font-medium",
              "transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease)]",
              selected
                ? "bg-surface-1 text-foreground shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------- rows */

/**
 * One transaction. A row on a wide screen, a stacked card on a phone — same
 * component, so the two can't drift apart.
 */
export function TxRow({
  date,
  title,
  subtitle,
  amount,
  meta,
  onClick,
  trailing,
}: {
  date: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  amount: number;
  meta?: React.ReactNode;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  const inner = (
    <>
      <span className="num w-[86px] shrink-0 text-[12px] text-muted-foreground">{date}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
      {meta ? <span className="hidden shrink-0 sm:block">{meta}</span> : null}
      <Money value={amount} signed className="shrink-0 text-sm font-medium" />
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3 py-3">{inner}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-10)] px-2 py-3 text-left -mx-2",
        "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent",
      )}
    >
      {inner}
    </button>
  );
}

/* --------------------------------------------------------------- feedback */

export function Alert({
  tone = "neutral",
  title,
  children,
  action,
}: {
  tone?: "neutral" | "positive" | "negative" | "warning" | "brand";
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-surface-2 border-border",
    positive: "bg-success-soft border-success/25",
    negative: "bg-danger-soft border-danger/30",
    warning: "bg-warning-soft border-warning/30",
    brand: "bg-brand-soft border-brand-border",
  } as const;

  return (
    <div
      role={tone === "negative" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-12)] border px-4 py-3",
        tones[tone],
      )}
    >
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn("text-[13px] text-muted-foreground", title && "mt-0.5")}>
            {children}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Rows of placeholder text while data loads. */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-hairline" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 py-3.5">
          <span className="skeleton h-3 w-16 shrink-0" />
          <span className="skeleton h-3.5 flex-1" style={{ maxWidth: `${60 - index * 6}%` }} />
          <span className="skeleton h-3.5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
