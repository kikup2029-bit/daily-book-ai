import { cn } from "@/lib/utils";

/**
 * The SimpleBooks mark: three ledger rows with today's picked out in the brand
 * colour. It reads as a list at any size, which is what the app is, and it
 * matches the home screen icon so the installed app and the website feel like
 * the same product.
 */
export function BrandMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-12)] bg-surface-2 ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        <circle cx="4" cy="6" r="1.6" className="fill-muted-foreground" />
        <rect x="8" y="5" width="9" height="2" rx="1" className="fill-muted-foreground" />
        <circle cx="4" cy="12" r="1.9" className="fill-brand" />
        <rect x="8" y="11" width="13" height="2.2" rx="1.1" className="fill-brand" />
        <circle cx="4" cy="18" r="1.6" className="fill-muted-foreground" />
        <rect x="8" y="17" width="6" height="2" rx="1" className="fill-muted-foreground" />
      </svg>
    </span>
  );
}

export function WordMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={30} />
      <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">SimpleBooks</span>
    </span>
  );
}
