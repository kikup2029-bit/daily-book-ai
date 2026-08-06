import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouteContext, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/brand-mark";
import { CommandPalette } from "@/components/command-palette";
import { OfflineBar } from "@/components/offline-bar";
import { HELP_NAV } from "@/lib/help-content";
import { clearOfflineData } from "@/lib/register-sw";
import { browserQueueStorage, counts } from "@/lib/offline-queue";

type Leaf = { to: string; label: string };
type Item = { label: string; to: string; children?: Leaf[] };

const NAV: Item[] = [
  {
    label: "Today",
    to: "/dashboard",
    children: [
      { to: "/dashboard", label: "Overview" },
      { to: "/add", label: "Add an entry" },
      { to: "/entries", label: "Find an entry" },
      { to: "/streaks", label: "Your streaks" },
      { to: "/ask", label: "Ask about your money" },
    ],
  },
  {
    label: "This month",
    to: "/monthly",
    children: [
      { to: "/monthly", label: "Overview" },
      { to: "/categories", label: "Where money went" },
      { to: "/daybyday", label: "Day by day" },
      { to: "/week", label: "Your week" },
      { to: "/outlook", label: "Can you cover it" },
      { to: "/busydays", label: "Busy and quiet days" },
      { to: "/budgets", label: "Budgets" },
      { to: "/goals", label: "Savings goals" },
      { to: "/bills", label: "Bills" },
    ],
  },
  {
    label: "Tools",
    to: "/household",
    children: [
      { to: "/household", label: "Household" },
      { to: "/margins", label: "Item margins" },
      { to: "/drawer", label: "Cash drawer" },
      { to: "/tax", label: "Tax set-aside" },
      { to: "/lock", label: "Lock this app" },
    ],
  },
  {
    label: "Export",
    to: "/export",
    children: [
      { to: "/export", label: "Pick dates" },
      { to: "/export?download=csv", label: "Download CSV" },
      { to: "/export?download=pdf", label: "Download PDF" },
    ],
  },
  {
    label: "Help",
    to: "/help",
    // Sections come from the help content itself, so adding a topic there
    // shows up here without touching this file.
    children: [{ to: "/help", label: "All topics" }, ...HELP_NAV],
  },
];

/**
 * True on phones and tablets — anything without a mouse.
 *
 * Hover menus are invisible on a touch screen: there's no way to hover, and a
 * tap goes straight to the link. This lets the same nav open on tap instead.
 */
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    setCoarse(query.matches);
    const onChange = (event: MediaQueryListEvent) => setCoarse(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return coarse;
}

const THEME_KEY = "simplebooks.theme";

/**
 * Keeps the phone's status bar the same colour as the page.
 *
 * Without this the bar behind the clock and battery stays dark after switching
 * to the light theme, which looks like a bug rather than a design.
 */
function paintStatusBar(light: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]');
  // These are the two page backgrounds converted out of oklch. They have to
  // match exactly or there's a visible seam where the status bar meets the app.
  if (meta) meta.setAttribute("content", light ? "#f9f9fc" : "#0e0f12");
}

/** Dark by default; the choice sticks between visits. */
function useTheme() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {
      saved = null;
    }
    const useLight = saved === "light";
    setLight(useLight);
    document.documentElement.classList.toggle("light", useLight);
    paintStatusBar(useLight);
  }, []);

  const toggle = () => {
    setLight((current) => {
      const next = !current;
      document.documentElement.classList.toggle("light", next);
      paintStatusBar(next);
      try {
        localStorage.setItem(THEME_KEY, next ? "light" : "dark");
      } catch {
        // Not remembering the choice is harmless.
      }
      return next;
    });
  };

  return { light, toggle };
}

export function AppTopNav({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useRouteContext({ from: "/_authenticated" });
  const userId = user?.id;
  const { light, toggle } = useTheme();

  // Which group's menu is showing. Hover on desktop, tap on touch.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which section is expanded in the phone menu.
  const [openSection, setOpenSection] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);

  // On a touch screen there is no hover, so a menu that only opens on hover
  // can't be opened at all. Tapping the group opens it instead.
  const touch = useCoarsePointer();

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // A small delay stops the menu vanishing while the pointer crosses the gap
  // between the trigger and the panel.
  const openNow = (label: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const signOut = async () => {
    // Signing out with entries still on the device would look like they'd
    // vanished. They're kept and sent on the next sign-in, but say so first.
    const { waiting, stuck } = counts(browserQueueStorage(userId));
    const held = waiting + stuck;
    if (held > 0) {
      const noun = held === 1 ? "entry" : "entries";
      const proceed = window.confirm(
        `${held} ${noun} haven't been sent yet. They'll stay on this device and go through next time you sign in on it. Sign out anyway?`,
      );
      if (!proceed) return;
    }

    await queryClient.cancelQueries();
    queryClient.clear();
    // Drop cached figures so they can't be read by whoever signs in next.
    await clearOfflineData();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isActive = (item: Item) =>
    item.children ? item.children.some((c) => c.to === pathname) : pathname === item.to;

  // Opening the menu on the section you're already in saves a tap and shows
  // where you are.
  const openMobile = () => {
    setOpenSection(NAV.find(isActive)?.label ?? null);
    setMobileOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* ---------- top bar ---------- */}
      {/*
        pt-safe pushes the bar below the clock and battery on a notched iPhone.
        The installed app draws under the status bar (that's what makes it feel
        like an app rather than a web page), so the padding has to be added back
        here or the nav sits underneath it.
      */}
      <header className="pt-safe sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1 px-5 sm:px-6">
          <Link
            to="/dashboard"
            className="mr-5 flex items-center gap-2.5 rounded-[var(--radius-8)]"
            aria-label="SimpleBooks home"
          >
            <BrandMark size={30} />
            <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              SimpleBooks
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => !touch && item.children && openNow(item.label)}
                  onMouseLeave={touch ? undefined : closeSoon}
                >
                  {/*
                    With a mouse this is a link and the menu opens on hover.
                    On a touch screen there's nothing to hover with, so the same
                    control becomes a button that opens the menu on tap.
                  */}
                  {item.children && touch ? (
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                      aria-expanded={openMenu === item.label}
                      className={`flex items-center gap-1.5 rounded-[var(--radius-8)] px-3 py-2 text-[13.5px] font-medium transition-colors duration-[var(--dur-fast)] ${
                        active ? "bg-accent text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`size-3.5 transition-transform ${
                          openMenu === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => item.children && setOpenMenu(null)}
                      className={`flex items-center gap-1.5 rounded-[var(--radius-8)] px-3 py-2 text-[13.5px] font-medium transition-colors duration-[var(--dur-fast)] ${
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      {item.children ? (
                        <ChevronDown
                          className={`size-3.5 transition-transform ${
                            openMenu === item.label ? "rotate-180" : ""
                          }`}
                        />
                      ) : null}
                    </Link>
                  )}

                  {item.children && openMenu === item.label ? (
                    <div
                      className="floating pop absolute left-0 top-[calc(100%+6px)] z-50 w-60 p-1.5"
                      onMouseEnter={() => !touch && openNow(item.label)}
                      onMouseLeave={touch ? undefined : closeSoon}
                    >
                      {/* On touch the group name isn't a link any more, so its
                          own page needs a row here. */}
                      {touch ? (
                        <Link
                          to={item.to}
                          onClick={() => setOpenMenu(null)}
                          className="block rounded-lg px-3 py-2 text-[13px] text-muted-foreground"
                        >
                          Go to {item.label}
                        </Link>
                      ) : null}
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block rounded-[var(--radius-8)] px-3 py-2 text-[13px] transition-colors duration-[var(--dur-fast)] ${
                            pathname === child.to
                              ? "bg-brand-soft font-medium text-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
                )
              }
              className="hidden items-center gap-2 rounded-[var(--radius-10)] border border-border bg-surface-1 py-1.5 pl-2.5 pr-2 text-[13px] text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:text-foreground sm:flex"
              aria-label="Search or jump to a page"
            >
              <Search className="size-3.5" />
              <span className="pr-6">Search…</span>
              <kbd className="rounded-[6px] border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-medium">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={toggle}
              className="flex size-9 items-center justify-center rounded-[var(--radius-8)] text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-accent hover:text-foreground"
              aria-label={light ? "Switch to dark" : "Switch to light"}
              title={light ? "Switch to dark" : "Switch to light"}
            >
              {light ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
            >
              Sign out
            </button>

            <button
              type="button"
              onClick={openMobile}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- mobile menu ---------- */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="pt-safe pb-safe absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-background px-5">
            <div className="flex h-16 items-center justify-between">
              <span className="flex items-center gap-2.5">
                <BrandMark size={30} />
                <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
                  SimpleBooks
                </span>
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="-mr-2 rounded-lg p-2 text-muted-foreground"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/*
              One section at a time. Showing every sub-item at once turned this
              into a wall of twenty-odd links with no sense of what belonged to
              what.
            */}
            <nav className="mt-2 pb-8">
              {NAV.map((item) => {
                const expanded = openSection === item.label;
                return (
                  <div key={item.label} className="border-b">
                    <button
                      type="button"
                      onClick={() => setOpenSection(expanded ? null : item.label)}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span
                        className={`text-[16px] ${
                          isActive(item)
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded && item.children ? (
                      <div className="pb-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className={`block rounded-[var(--radius-8)] px-3 py-2.5 text-[15px] ${
                              pathname === child.to
                                ? "bg-brand-soft font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={signOut}
                className="mt-6 text-[15px] text-muted-foreground"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      ) : null}

      <OfflineBar userId={userId} />

      {/* ---------- page ---------- */}
      {/* pb-page keeps the last row clear of the iPhone home indicator. */}
      <main className="pb-page mx-auto w-full max-w-6xl px-5 pt-8 sm:px-6 sm:pt-10">
        {children}
      </main>

      <CommandPalette />
    </div>
  );
}
