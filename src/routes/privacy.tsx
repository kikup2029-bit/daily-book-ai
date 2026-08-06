/**
 * The privacy policy.
 *
 * Every claim on this page was checked against the code rather than copied from
 * a template. Where the honest answer is uncomfortable — voice input leaving the
 * device, business figures being sent to an AI provider — it says so, because a
 * policy that overstates how private the product is causes the exact harm it
 * exists to prevent.
 *
 * If you change how data moves through the app, this page is part of that
 * change. The list of processors below is the one that needs updating.
 */

import { createFileRoute, Link } from "@tanstack/react-router";

import { LandingShell } from "@/components/landing/landing-shell";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/contact";
import { LEGAL_UPDATED, LegalPage, LegalSection } from "@/components/landing/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — SimpleBooks" },
      {
        name: "description",
        content:
          "What SimpleBooks collects, who it is shared with, where it is stored, and how to get it back or delete it.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LandingShell>
      <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
        <p>
          SimpleBooks is a bookkeeping app for small businesses. This page explains what it
          collects, why, who else sees it, and how to get it back or delete it. It is written to be
          read, not to be skimmed past.
        </p>

        <LegalSection title="What we collect">
          <p>
            <strong className="text-foreground">Your account.</strong> An email address and a
            password. The password is stored hashed by our authentication provider; nobody at
            SimpleBooks can read it.
          </p>
          <p>
            <strong className="text-foreground">What you type into the app.</strong> Money in and
            out, amounts, dates, categories, notes, products, cash counts, bills, budgets, and — if
            you use invoicing — the names, email addresses and amounts of the customers you invoice.
            This is your business record. It is the point of the product.
          </p>
          <p>
            <strong className="text-foreground">Receipt photos</strong>, if you upload them.
          </p>
          <p>
            <strong className="text-foreground">Your app lock PIN</strong>, if you set one. It is
            salted and hashed before it is stored. The digits themselves are never saved and cannot
            be recovered from what is stored.
          </p>
          <p>
            <strong className="text-foreground">Payment status</strong>, if you subscribe: which
            plan you are on, whether it is active, and when it renews.{" "}
            <strong className="text-foreground">We never see or store your card details.</strong>{" "}
            Card numbers are entered on Stripe&rsquo;s own payment page and never pass through
            SimpleBooks.
          </p>
          <p>
            We do not use advertising trackers, and we do not sell personal information to anyone.
          </p>
        </LegalSection>

        <LegalSection title="What stays on your device">
          <p>
            Some things are kept in your browser&rsquo;s local storage and are never sent to us:
            your chosen language, light or dark theme, which month you were last looking at, and
            whether you have dismissed the install prompt.
          </p>
          <p>
            Entries you make while offline are also queued on your device until a connection
            returns, at which point they are sent and the queue is cleared. Clearing your browser
            data will delete anything still waiting in that queue.
          </p>
        </LegalSection>

        <LegalSection title="Who else your data reaches">
          <p>
            SimpleBooks is a small product built on other companies&rsquo; infrastructure. These are
            all of them:
          </p>
          <ul className="mt-3 space-y-3">
            <li>
              <strong className="text-foreground">Supabase</strong> — stores your account, your
              records and your receipt images.
            </li>
            <li>
              <strong className="text-foreground">Cloudflare</strong> — runs and serves the app.
            </li>
            <li>
              <strong className="text-foreground">Stripe</strong> — handles subscription payments
              and holds your card details. Stripe&rsquo;s own privacy policy governs those. We
              receive only your subscription status and customer reference.
            </li>
            <li>
              <strong className="text-foreground">An AI provider</strong> — see the next section.
            </li>
            <li>
              <strong className="text-foreground">Google Fonts</strong> — the app loads its
              typefaces from Google, which means Google sees your IP address when a page loads. The
              fonts are needed so that Gujarati, Hindi, Urdu and Chinese render as words instead of
              empty boxes.
            </li>
          </ul>
          <p className="mt-3">
            We share your information with these providers only so they can perform their function.
            We do not sell it, rent it, or hand it to advertisers. We will disclose it if legally
            compelled to.
          </p>
        </LegalSection>

        <LegalSection title="AI features, in plain terms">
          <p>
            When you ask a question about your money, or upload a receipt for automatic reading, the
            relevant figures — or the receipt image — are sent to an AI provider so a response can
            be generated. Depending on how the app is configured, that provider is Groq, Google
            (Gemini), Cloudflare Workers AI, or Anthropic.
          </p>
          <p>
            This means your business figures leave our servers when you use those features. They are
            sent to answer your question and for no other purpose, and we do not use your data to
            train any AI model. What the provider does with data sent to it is governed by that
            provider&rsquo;s own terms.
          </p>
          <p>
            If you would rather this never happened, do not use the &ldquo;Ask about your
            money&rdquo; feature or receipt auto-fill. Everything else in the app works without
            them.
          </p>
        </LegalSection>

        <LegalSection title="Voice input">
          <p>
            The voice option in quick-add uses your browser&rsquo;s built-in speech recognition. On
            most browsers — including Safari and Chrome — that means the audio is sent to Apple or
            Google to be transcribed. It does not pass through SimpleBooks, and we never receive the
            recording, but it does leave your device. Type instead if you would rather it did not.
          </p>
        </LegalSection>

        <LegalSection title="Sharing with a household or partner">
          <p>
            If you use household sharing, entries you mark as shared or split become visible to the
            people you have shared with. Entries you leave private stay private. Once someone has
            seen a shared entry, marking it private afterwards does not unsee it.
          </p>
        </LegalSection>

        <LegalSection title="How long we keep it">
          <p>
            Your records stay until you delete them or close your account. Delete an entry and it is
            gone from the app; delete your account and your records and receipt images are removed.
          </p>
          <p>
            Some payment records are kept longer than that, because tax and anti-fraud law requires
            it — Stripe retains transaction records independently of us.
          </p>
        </LegalSection>

        <LegalSection title="Your rights">
          <p>
            You can export everything you have entered at any time, as CSV or PDF, from inside the
            app. You do not need to ask us, and there is no charge.
          </p>
          <p>
            You can also ask us to tell you what we hold about you, correct it, or delete it. Email{" "}
            <a className="text-brand hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            and we will respond within 30 days. We will not charge you for asking, and we will not
            treat you differently for having asked.
          </p>
          <p>
            If you live in California, the CCPA gives you these rights explicitly, including the
            right to know what is collected and the right to have it deleted. We do not sell or
            share personal information as those terms are defined there, so there is nothing to opt
            out of. Residents of other states with similar laws have equivalent rights and the same
            address to write to.
          </p>
        </LegalSection>

        <LegalSection title="Security">
          <p>
            Your records are readable only by your account. This is enforced at the database level
            rather than only in the app, so a bug in the interface cannot expose another
            person&rsquo;s books. Traffic is encrypted in transit. Payment credentials never reach
            our servers at all.
          </p>
          <p>
            No system is perfect. If we ever discover a breach affecting your data, we will tell you
            about it rather than wait to be asked.
          </p>
        </LegalSection>

        <LegalSection title="Children">
          <p>
            SimpleBooks is a business tool and is not intended for anyone under 13. We do not
            knowingly collect information from children. If you believe a child has created an
            account, write to us and we will remove it.
          </p>
        </LegalSection>

        <LegalSection title="Changes">
          <p>
            If this policy changes in a way that materially affects you, we will say so in the app
            rather than quietly editing this page. The date at the top always reflects the current
            version.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>
            Questions about any of this go to{" "}
            <a className="text-brand hover:underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . SimpleBooks is operated from the United States, and this policy is governed by United
            States law.
          </p>
        </LegalSection>

        <div className="mt-10 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/">Back to the home page</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/terms">Read the Terms</Link>
          </Button>
        </div>
      </LegalPage>
    </LandingShell>
  );
}
