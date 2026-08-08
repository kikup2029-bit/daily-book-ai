/**
 * The languages, each written the way its own speakers write it.
 *
 * The list comes from LOCALE_LIST rather than being retyped here, so the page
 * can never advertise a language the app has since dropped — or miss one it
 * gained. The COUNT is derived from the same list for the same reason: the copy
 * used to say "all six" as literal text, and the moment Urdu and Chinese were
 * held back it became a false claim on the one section whose entire subject is
 * how many languages there are.
 *
 * Each name carries its own lang and dir, which is what lets a screen reader
 * pick the right voice and puts a right-to-left name the correct way round on
 * an otherwise left-to-right page.
 */

import { LOCALES, LOCALE_LIST, useI18n } from "@/lib/i18n";

import { Section, SectionHeading } from "@/components/landing/section";

export function Languages() {
  const { t } = useI18n();

  return (
    <Section id="languages" labelledBy="languages-heading" className="bg-surface-2">
      <SectionHeading
        id="languages-heading"
        eyebrow={t("landing.languagesEyebrow")}
        title={t("landing.languagesTitle")}
        description={t("landing.languagesDescription", { count: LOCALE_LIST.length })}
      />

      <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {LOCALE_LIST.map((code) => {
          const meta = LOCALES[code];
          return (
            <li key={code}>
              <span
                lang={code}
                dir={meta.dir}
                className="panel inline-flex items-baseline gap-2 px-4 py-2.5 text-[17px] font-medium"
              >
                {meta.native}
              </span>
            </li>
          );
        })}
      </ul>

      {/*
        Only shown when a right-to-left language is actually on offer. The note
        names Urdu specifically, and Urdu is currently held back — leaving it up
        would boast about mirroring a layout for a language you can't pick.
      */}
      {LOCALE_LIST.some((code) => LOCALES[code].dir === "rtl") ? (
        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          {t("landing.languagesRtlNote")}
        </p>
      ) : null}
    </Section>
  );
}
