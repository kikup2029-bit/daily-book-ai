/**
 * The first screen.
 *
 * One promise, said the way a market trader would say it, and one button. The
 * secondary link goes down the page rather than off it, because someone who
 * isn't ready to sign up should still have somewhere to go that isn't "back".
 */

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { WifiOff, Sparkles, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { Translator } from "@/lib/i18n/translate";
import { TRIAL_DAYS } from "@/lib/pricing";

/**
 * A function rather than a module constant: a constant would call `t` once, at
 * import time, and freeze whichever language happened to load first. The ids
 * are stable so the keys survive a reordering; the text lives in the dictionary.
 */
function reassurances(t: Translator) {
  return [
    { id: "speed", icon: Clock, text: t("landing.heroReassuranceSpeed") },
    { id: "offline", icon: WifiOff, text: t("landing.heroReassuranceOffline") },
    {
      id: "trial",
      icon: Sparkles,
      // The trial length comes from pricing.ts, never retyped into the string.
      text: t("landing.heroReassuranceTrial", { count: TRIAL_DAYS }),
    },
  ];
}

export function Hero() {
  const { t } = useI18n();
  const items = useMemo(() => reassurances(t), [t]);

  return (
    <section className="px-4 pb-4 pt-14 sm:px-6 sm:pb-8 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl text-center">
        <h1 className="text-[32px] leading-[1.12] sm:text-[48px]">{t("landing.heroTitle")}</h1>

        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]">
          {t("landing.heroBody")}
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="brand" size="lg">
            {/*
              This button makes an account, and no card is asked for on the
              other side of it — so it cannot promise a trial. The trial is
              offered once, on /welcome, where the disclosure sits next to it.
            */}
            <Link to="/auth">{t("landing.startFree")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#how-it-works">{t("landing.heroSeeHowItWorks")}</a>
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {items.map(({ id, icon: Icon, text }) => (
            <li key={id} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
