/**
 * Terms — deliberately empty, for the same reason as /privacy.
 *
 * Terms of service decide what happens when something goes wrong: a failed
 * payment, a lost month of entries, a disputed refund. Drafting them by
 * guesswork produces a document that either doesn't hold or promises more than
 * the business can deliver.
 */

import { createFileRoute, Link } from "@tanstack/react-router";

import { LandingShell } from "@/components/landing/landing-shell";
import { Alert } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — SimpleBooks" },
      {
        name: "description",
        content: "SimpleBooks' terms of service. This page is a placeholder awaiting legal review.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LandingShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-[28px] leading-tight sm:text-[34px]">Terms</h1>

        <div className="mt-6 space-y-5">
          <Alert tone="warning" title="These are not the terms yet">
            This is a placeholder. Real terms of service have to be published here — and the
            subscription flow switched on — before SimpleBooks charges anyone.
          </Alert>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            The finished page needs to cover at least: what the service does and does not promise
            (it is a record-keeping tool, not accounting or tax advice), how subscriptions are
            billed, renewed, cancelled and refunded, what happens to your entries if you stop paying
            or the service ends, acceptable use, limits of liability, and which country&rsquo;s law
            applies.
          </p>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Placeholder legal text is left out on purpose. Terms that were never reviewed are not
            terms — they are a liability dressed up as one.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/">Back to the home page</Link>
          </Button>
        </div>
      </div>
    </LandingShell>
  );
}
