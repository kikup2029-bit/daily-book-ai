/**
 * The public wrapper: header, page, footer — and the light theme.
 *
 * The app itself is dark by default with a toggle behind the sign-in wall, but
 * a visitor has no toggle and the marketing pages are designed on the pale
 * canvas. So these pages pin themselves to the app's *own* light tokens rather
 * than inventing a second palette: same iris brand, same green/red for money in
 * and out, same surfaces. Landing and product look like one product because
 * they are reading the same variables.
 *
 * The class goes on two places on purpose. On the wrapper it survives the
 * server render, so the first paint is already light. On <html> it also catches
 * the things that escape this subtree — the page background behind an
 * overscroll bounce, and the language menu, which portals to <body>.
 */

import { useEffect, type ReactNode } from "react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

/** Matches the light `--background` in styles.css, converted out of oklch. */
const LIGHT_STATUS_BAR = "#f9f9fc";

function useLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    // Someone who already chose light in the app keeps it on the way out.
    const alreadyLight = root.classList.contains("light");
    root.classList.add("light");

    const meta = document.querySelector('meta[name="theme-color"]');
    const previousColor = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", LIGHT_STATUS_BAR);

    return () => {
      if (!alreadyLight) root.classList.remove("light");
      if (meta && previousColor !== null) meta.setAttribute("content", previousColor);
    };
  }, []);
}

export function LandingShell({ children }: { children: ReactNode }) {
  useLightTheme();

  return (
    <div className="light flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
