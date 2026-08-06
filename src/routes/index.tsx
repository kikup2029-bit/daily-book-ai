/**
 * The front door.
 *
 * Public — no auth check and no redirect — because this is the page that has to
 * convince someone to make an account in the first place. Signed-in visitors
 * get the same page with a "Sign in" link that lands them straight back in the
 * app.
 *
 * It reads top to bottom as one argument: what it does for you, what it looks
 * like, why it's worth it, how little there is to learn, that it speaks your
 * language, what it costs, and the things you'd want answered before paying.
 */

import { createFileRoute } from "@tanstack/react-router";

import { Benefits } from "@/components/landing/benefits";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingShell } from "@/components/landing/landing-shell";
import { Languages } from "@/components/landing/languages";
import { Pricing } from "@/components/landing/pricing";
import { ProductPreview } from "@/components/landing/product-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { LOCALES, LOCALE_LIST } from "@/lib/i18n";
import { PLANS } from "@/lib/pricing";

const TITLE = "SimpleBooks — know where your business stands today";

const DESCRIPTION =
  "A daily money log for people who run a small business. Log money in and out in seconds, scan receipts, send invoices and see whether you're ahead — no bookkeeping knowledge needed.";

const OG_IMAGE = "/icons/icon-512.png";

/**
 * What search engines and assistants are told about the product.
 *
 * The price is derived from PLANS.pro rather than written out, so a price
 * change can't leave a stale number in the markup where nobody thinks to look.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SimpleBooks",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web browser, iOS, Android",
  description: DESCRIPTION,
  inLanguage: LOCALE_LIST.map((code) => LOCALES[code].tag),
  offers: {
    "@type": "Offer",
    name: PLANS.pro.name,
    price: (PLANS.pro.priceCents / 100).toFixed(2),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <LandingShell>
      <script
        type="application/ld+json"
        // Serialised JSON, not user input — there is nothing here that could
        // arrive from outside the bundle.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Hero />
      <ProductPreview />
      <Benefits />
      <HowItWorks />
      <Languages />
      <Testimonials />
      <Pricing />
      <Faq />
      <ClosingCta />
    </LandingShell>
  );
}
