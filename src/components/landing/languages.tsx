/**
 * The six languages, each written the way its own speakers write it.
 *
 * The list comes from LOCALES rather than being retyped here, so the page can
 * never advertise a language the app has since dropped — or miss one it gained.
 * Each name carries its own lang and dir, which is what lets a screen reader
 * pick the right voice and puts اردو the right way round on an English page.
 */

import { LOCALES, LOCALE_LIST } from "@/lib/i18n";

import { Section, SectionHeading } from "@/components/landing/section";

export function Languages() {
  return (
    <Section id="languages" labelledBy="languages-heading" className="bg-surface-2">
      <SectionHeading
        id="languages-heading"
        eyebrow="Languages"
        title="In your language, not translated at you"
        description="The whole app — buttons, help, dates and amounts — speaks all six. Change it any time from the language button at the top."
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

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Urdu reads right to left, and the layout mirrors with it rather than leaving the text
        stranded in a left-to-right shell.
      </p>
    </Section>
  );
}
