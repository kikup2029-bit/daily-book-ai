/**
 * Shared layout for the Privacy and Terms pages.
 *
 * Legal text is the one place in this app where people genuinely read prose
 * top-to-bottom, so it gets the opposite treatment to the dashboard: a narrow
 * measure, generous line height, and no visual competition. Nothing here is a
 * card or a panel — boxes make a document feel like an interface, and an
 * interface is easy to skip.
 */

import type { ReactNode } from "react";

/**
 * The date shown on both pages. One constant, because two legal pages claiming
 * different "last updated" dates makes the reader wonder which one is stale.
 * Bump this whenever either page's substance changes.
 */
export const LEGAL_UPDATED = "6 August 2026";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[42rem] px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-display text-[30px] leading-tight tracking-[-0.02em] sm:text-[36px]">
        {title}
      </h1>
      <p className="eyebrow mt-3">Last updated {updated}</p>

      {/*
        The colour and size are set once here and inherited, so the page reads
        as one continuous document rather than a stack of separately styled
        fragments. Links and <strong> lift back to full contrast.
      */}
      <div className="mt-8 space-y-5 text-[15px] leading-[1.75] text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-5">
      <h2 className="font-display text-[19px] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}
