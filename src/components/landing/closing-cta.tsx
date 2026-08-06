/**
 * The last thing on the page.
 *
 * Someone who has read as far as the FAQ has already decided; making them
 * scroll back to the top to act on it is a needless obstacle.
 */

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { Section } from "@/components/landing/section";

export function ClosingCta() {
  return (
    <Section labelledBy="closing-cta-heading" className="bg-surface-2">
      <div className="mx-auto max-w-xl text-center">
        <h2 id="closing-cta-heading" className="text-[24px] leading-tight sm:text-[30px]">
          Start with today&rsquo;s takings
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          One entry is enough to begin. The free plan doesn&rsquo;t ask for a card and doesn&rsquo;t
          run out.
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild variant="brand" size="lg">
            <Link to="/auth">Start free</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
