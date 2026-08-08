/**
 * What you actually get, one plain sentence at a time.
 *
 * Ordered by how early you meet it: logging is minute one, privacy is the thing
 * you think about after you've decided you like it.
 */

import { useMemo } from "react";
import {
  Camera,
  FileText,
  Lock,
  PiggyBank,
  Sparkles,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";

import { Section, SectionHeading } from "@/components/landing/section";

/**
 * A function of `t`, not a module constant: a constant is built once at import
 * and would keep whichever language loaded first for the life of the tab. The
 * `id` is what stays put — the words are looked up fresh on every render.
 */
function benefits(
  t: Translator,
): Array<{ id: string; icon: LucideIcon; title: string; body: string }> {
  return [
    {
      id: "logging",
      icon: Zap,
      title: t("landing.benefitLoggingTitle"),
      body: t("landing.benefitLoggingBody"),
    },
    {
      id: "ask",
      icon: Sparkles,
      title: t("landing.benefitAskTitle"),
      body: t("landing.benefitAskBody"),
    },
    {
      id: "receipt",
      icon: Camera,
      title: t("landing.benefitReceiptTitle"),
      body: t("landing.benefitReceiptBody"),
    },
    {
      id: "invoice",
      icon: FileText,
      title: t("landing.benefitInvoiceTitle"),
      body: t("landing.benefitInvoiceBody"),
    },
    {
      id: "budgets",
      icon: PiggyBank,
      title: t("landing.benefitBudgetsTitle"),
      body: t("landing.benefitBudgetsBody"),
    },
    {
      id: "offline",
      icon: WifiOff,
      title: t("landing.benefitOfflineTitle"),
      body: t("landing.benefitOfflineBody"),
    },
    {
      id: "privacy",
      icon: Lock,
      title: t("landing.benefitPrivacyTitle"),
      body: t("landing.benefitPrivacyBody"),
    },
  ];
}

export function Benefits() {
  const { t } = useI18n();
  const items = useMemo(() => benefits(t), [t]);

  return (
    <Section id="features" labelledBy="features-heading" className="bg-surface-2">
      <SectionHeading
        id="features-heading"
        eyebrow={t("landing.benefitsEyebrow")}
        title={t("landing.benefitsTitle")}
        description={t("landing.benefitsDescription")}
      />

      <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ id, icon: Icon, title, body }) => (
          <li key={id} className="flex gap-3.5">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-10)] bg-brand-soft text-brand"
              aria-hidden="true"
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
