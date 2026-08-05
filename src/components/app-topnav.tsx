import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CommandPalette } from "@/components/command-palette";

type Leaf = { to: string; label: string };
type Item = { label: string; to: string; children?: Leaf[] };

const NAV: Item[] = [
  {
    label: "Today",
    to: "/dashboard",
    children: [
      { to: "/dashboard", label: "Overview" },
      { to: "/add", label: "Add an entry" },
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
];

const THEME_KEY = "simplebooks.theme";

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
  }, []);

  const toggle = () => {
    setLight((current) => {
      const next = !current;
      document.documentElement.classList.toggle("light", next);
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
  const { light, toggle } = useTheme();

  // Which group's menu is showing. Hover on desktop, tap on mobile.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

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

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isActive = (item: Item) =>
    item.children ? item.children.some((c) => c.to === pathname) : pathname === item.to;

  return (
    <div className="min-h-screen">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center gap-1 px-5">
          <Link
            to="/dashboard"
            className="mr-6 text-sm font-semibold tracking-tight text-foreground"
          >
            SimpleBooks
          </Link>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && openNow(item.label)}
                  onMouseLeave={closeSoon}
                >
                  <Link
                    to={item.to}
                    onClick={() => item.children && setOpenMenu(null)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
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
                    {active ? (
                      <span className="absolute inset-x-3 -bottom-[1px] h-[1.5px] bg-foreground" />
                    ) : null}
                  </Link>

                  {item.children && openMenu === item.label ? (
                    <div
                      className="absolute left-0 top-full z-50 w-56 rounded-xl border bg-popover p-1.5 shadow-xl"
                      onMouseEnter={() => openNow(item.label)}
                      onMouseLeave={closeSoon}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                            pathname === child.to
                              ? "bg-accent text-foreground"
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
              className="hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
              aria-label="Open command palette"
            >
              <Search className="size-3.5" />
              <span>Search</span>
              <kbd className="rounded border px-1 py-0.5 text-[10px]">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={toggle}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
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
              onClick={() => setMobileOpen(true)}
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
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-background px-5 pb-8 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">SimpleBooks</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-muted-foreground"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-6 space-y-6">
              {NAV.map((item) => (
                <div key={item.label}>
                  <Link
                    to={item.to}
                    className="eyebrow block"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <div className="mt-2 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setMobileOpen(false)}
                          className={`block py-2 text-[15px] ${
                            pathname === child.to
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <button
                type="button"
                onClick={signOut}
                className="border-t pt-5 text-[15px] text-muted-foreground"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      ) : null}

      {/* ---------- page ---------- */}
      <main className="mx-auto w-full max-w-4xl px-5 pb-28 pt-12">{children}</main>

      <CommandPalette />
    </div>
  );
}
