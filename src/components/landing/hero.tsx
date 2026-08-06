/**
 * The first screen.
 *
 * One promise, said the way a market trader would say it, and one button. The
 * secondary link goes down the page rather than off it, because someone who
 * isn't ready to sign up should still have somewhere to go that isn't "back".
 */

import { Link } from "@tanstack/react-router";
import { WifiOff, Sparkles, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

const REASSURANCES = [
  { icon: Clock, text: "About ten seconds an entry" },
  { icon: WifiOff, text: "Keeps working with no signal" },
  { icon: Sparkles, text: "Free plan, no card needed" },
];

export function Hero() {
  return (
    <section className="px-4 pb-4 pt-14 sm:px-6 sm:pb-8 sm:pt-24">
      <div className="mx-auto w-full max-w-3xl text-center">
        <h1 className="text-[32px] leading-[1.12] sm:text-[48px]">
          Know where your business stands, today
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]">
          Write down the money coming in and going out as it happens. SimpleBooks adds it up for
          you, so at any point in the day you can see whether you&rsquo;re ahead — without a
          spreadsheet, and without knowing the first thing about bookkeeping.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="brand" size="lg">
            <Link to="/auth">Start free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {REASSURANCES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Icon className="size-3.5 shrink-0" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
