/**
 * The frame every landing section shares.
 *
 * One place for the horizontal rhythm and the vertical spacing, so the page
 * reads as a single column of evenly spaced blocks rather than a stack of
 * sections that each invented their own padding.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export function Section({
  id,
  labelledBy,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  /** id of the heading that names this section, for screen readers. */
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      // scroll-mt keeps the heading clear of the sticky header when the
      // "See how it works" link jumps here.
      className={cn("scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20", className)}
    >
      <div className={cn("mx-auto w-full max-w-5xl", innerClassName)}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className="mt-2 text-[24px] leading-tight sm:text-[32px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
