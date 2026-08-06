/**
 * The bar that follows you down the marketing page.
 *
 * It carries exactly four things: who this is, what language you'd like it in,
 * the way back to an existing account, and the one action the page is asking
 * for. Anything else competes with the sign-up button.
 */

import { Link } from "@tanstack/react-router";

import { WordMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-1.5 px-4 sm:gap-3 sm:px-6">
        <Link
          to="/"
          aria-label="SimpleBooks — home"
          // Allowed to shrink but never to wrap: two lines of wordmark would
          // burst the fixed bar height on a 360px phone.
          className="min-w-0 shrink overflow-hidden whitespace-nowrap"
        >
          <WordMark />
        </Link>

        {/* ms-auto rather than ml-auto, so the nav sits on the trailing edge in
            Urdu too instead of colliding with the wordmark. */}
        <nav aria-label="Site" className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <LanguageSwitcher compact />
          {/* Tighter padding on the narrowest phones: the four items together
              are within a couple of pixels of 360px at the default size. */}
          <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild variant="brand" size="sm">
            <Link to="/auth">Start free</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
