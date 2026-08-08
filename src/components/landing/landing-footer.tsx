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
import { useI18n } from "@/lib/i18n";

export function LandingFooter() {
  const { t } = useI18n();
  const linkClass =
    "rounded-[var(--radius-8)] text-[13px] text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:text-foreground";

  return (
    // pb-safe on the <footer>, not on the inner container, so the surface
    // colour still paints all the way to the bottom of the glass while the
    // links sit above the home indicator instead of inside its swipe area.
    <footer className="pb-safe border-t border-border bg-surface-2">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <WordMark />

          <nav aria-label={t("landing.footerNavLabel")}>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <li>
                <Link to="/privacy" className={linkClass}>
                  {t("landing.footerPrivacy")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClass}>
                  {t("landing.footerTerms")}
                </Link>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                  {t("landing.footerContact")}
                </a>
              </li>
              <li>
                <Link to="/auth" className={linkClass}>
                  {t("landing.signIn")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="pricing" className={linkClass}>
                  {t("landing.footerPricing")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-muted-foreground">
          {t("landing.footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}
