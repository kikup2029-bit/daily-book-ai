/**
 * The bottom of the page.
 *
 * Small and honest: the legal pages, a way to reach a person, and the two
 * routes back into the product. No sitemap of links nobody follows.
 */

import { Link } from "@tanstack/react-router";

import { WordMark } from "@/components/brand-mark";
// Shared with the Privacy and Terms pages, so the three can't drift apart.
import { CONTACT_EMAIL } from "@/lib/contact";

export function LandingFooter() {
  const linkClass =
    "rounded-[var(--radius-8)] text-[13px] text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground";

  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <WordMark />

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <Link to="/privacy" className={linkClass}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClass}>
                  Terms
                </Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                  Contact
                </a>
              </li>
              <li>
                <Link to="/auth" className={linkClass}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/" hash="pricing" className={linkClass}>
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-muted-foreground">
          SimpleBooks is a record-keeping tool, not an accountant. It won&rsquo;t file your tax
          return or tell you what you owe.
        </p>
      </div>
    </footer>
  );
}
