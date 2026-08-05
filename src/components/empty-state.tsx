/**
 * What a page shows before there's any data: a faded sample of the real thing
 * plus a nudge to log something, rather than blank charts and $0.00.
 */
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  blurb,
  sample,
}: {
  title: string;
  blurb: string;
  /** A greyed-out mock of the populated page. */
  sample?: React.ReactNode;
}) {
  return (
    <section className="py-8">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{blurb}</p>

      <Button asChild size="lg" className="mt-5">
        <Link to="/add">Log your first entry</Link>
      </Button>

      {sample ? (
        <div className="mt-8">
          <p className="eyebrow">Here&apos;s what this will look like</p>
          <div
            aria-hidden="true"
            className="pointer-events-none mt-3 select-none opacity-35 blur-[0.3px]"
          >
            {sample}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/** A small stand-in bar chart for empty chart pages. */
export function SampleBars({ heights = [40, 65, 30, 80, 55, 70, 45] }: { heights?: number[] }) {
  return (
    <div className="flex h-32 items-end gap-2">
      {heights.map((height, index) => (
        <div key={index} className="flex-1 rounded-t bg-muted-foreground" style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

/** A few stand-in rows for empty list pages. */
export function SampleRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between py-3">
          <span className="skeleton h-3.5" style={{ width: `${45 - index * 5}%` }} />
          <span className="skeleton h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}
