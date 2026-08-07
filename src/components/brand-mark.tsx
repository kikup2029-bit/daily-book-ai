import { cn } from "@/lib/utils";

/**
 * The SimpleBooks mark: a ledger, with today's line picked out.
 *
 * DESIGNED FOR THE SMALLEST SIZE FIRST. A logo lives at 16px in a browser tab
 * and as a ~40px circle in a social feed, and detail that survives at 200px
 * turns to mush there. So:
 *
 *  - Three shapes, no more. Cover, spine, one accent line.
 *  - Nothing thinner than 2 units in a 24-unit box — below that, a hairline
 *    disappears entirely once the browser rounds it to a physical pixel.
 *  - The accent line is the widest element, so the brand colour is still
 *    legible as colour when the shape itself has stopped being readable.
 *  - No text inside the icon. Letters at 16px are noise.
 *
 * The single coloured line is the idea of the product: one day's takings,
 * written down. It also means the mark degrades gracefully — at tiny sizes it
 * reads as "a book with something in it", which is enough.
 */
export function BrandMark({
  className,
  size = 40,
  /** Drop the rounded tile — for a favicon or an app icon that gets its own. */
  bare = false,
}: {
  className?: string;
  size?: number;
  bare?: boolean;
}) {
  const glyph = (
    <svg
      width={bare ? size : size * 0.58}
      height={bare ? size : size * 0.58}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
    >
      {/* The cover. One solid silhouette — a book read at 16px is a rectangle,
          and any attempt to draw a spine as a separate bar just reads as two
          bars side by side. */}
      <rect x="4" y="2.5" width="16" height="19" rx="2.75" className="fill-foreground" />

      {/* The bookmark ribbon. This is what makes it a book rather than a card,
          a note or a pause button, and the notch survives being shrunk because
          it's a silhouette change, not a detail. It also carries the brand
          colour, so the mark still reads as ours in a monochrome tab strip. */}
      <path d="M13.25 2.5h4v8.25l-2-1.85-2 1.85z" className="fill-brand" />
    </svg>
  );

  if (bare) return <span className={cn("inline-flex shrink-0", className)}>{glyph}</span>;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-12)] bg-surface-2 ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {glyph}
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
