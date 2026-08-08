/**
 * What a page shows before there's any data: a faded sample of the real thing
 * plus a nudge to log something, rather than blank charts and $0.00.
 */
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

  return (
    <section className="py-8">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
        >
          <Sparkles className="size-6" />
        </span>

        <h2 className="mt-5 text-xl">{title}</h2>
        <p className="mt-2 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
          {blurb}
        </p>

        <Button asChild variant="brand" size="lg" className="mt-6">
          <Link to="/add">{t("empty.logFirstEntry")}</Link>
        </Button>
      </div>

      {sample ? (
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <p className="eyebrow shrink-0">{t("empty.samplePreview")}</p>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none mt-4 select-none opacity-35 blur-[0.3px]"
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
        <div
          key={index}
          className="flex-1 rounded-t-[var(--radius-8)] bg-muted-foreground"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

/** A few stand-in rows for empty list pages. */
export function SampleRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-hairline">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-3.5">
          <span className="skeleton h-3.5" style={{ width: `${45 - index * 5}%` }} />
          <span className="skeleton h-3.5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
