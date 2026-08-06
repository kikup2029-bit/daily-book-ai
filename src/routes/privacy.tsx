/**
 * Privacy — deliberately empty.
 *
 * A privacy policy is a legal document with real consequences under GDPR and
 * the UK DPA, and a plausible-sounding one written by a developer is worse than
 * none: it makes promises nobody has checked the product actually keeps. So
 * this page says what it is and what has to happen before it can say anything
 * else.
 */

import { createFileRoute, Link } from "@tanstack/react-router";

import { LandingShell } from "@/components/landing/landing-shell";
import { Alert } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — SimpleBooks" },
      {
        name: "description",
        content: "SimpleBooks' privacy policy. This page is a placeholder awaiting legal review.",
      },
      // Nothing here is worth indexing until it has real content.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LandingShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="text-[28px] leading-tight sm:text-[34px]">Privacy</h1>

        <div className="mt-6 space-y-5">
          <Alert tone="warning" title="This page has no policy on it yet">
            What you are reading is a placeholder, not a privacy policy. SimpleBooks must not take a
            payment or open sign-ups to the public until a real one — written or reviewed by someone
            qualified — is published here.
          </Alert>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            The finished page needs to set out, accurately and in plain language: what personal data
            the app collects, why it is collected and on what lawful basis, who it is shared with
            (including the payment processor and any AI provider used to answer questions about your
            figures), where it is stored and for how long, how to export or delete it, and who to
            contact about it.
          </p>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            None of that is written here on purpose. Inventing it would create commitments nobody
            has verified the product keeps, which is precisely the harm a privacy policy exists to
            prevent.
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
