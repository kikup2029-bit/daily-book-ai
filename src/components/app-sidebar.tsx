import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  LogOut,
  Menu,
  NotebookPen,
  Percent,
  Sun,
  Tag,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Leaf = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type Group = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Landing page for the group itself. */
  to: string;
  children: Leaf[];
};

const TOP: Leaf[] = [{ to: "/dashboard", label: "Today", icon: Sun }];

const MONTH: Group = {
  label: "This month",
  icon: CalendarDays,
  to: "/monthly",
  children: [
    { to: "/monthly", label: "Overview", icon: CalendarDays },
    { to: "/categories", label: "Where money went", icon: Tag },
    { to: "/daybyday", label: "Day by day", icon: CalendarDays },
    { to: "/week", label: "Your week", icon: Sun },
    { to: "/outlook", label: "Can you cover it", icon: Wallet },
    { to: "/busydays", label: "Busy and quiet days", icon: CalendarDays },
    { to: "/budgets", label: "Budgets", icon: Percent },
    { to: "/goals", label: "Savings goals", icon: Tag },
    { to: "/bills", label: "Bills", icon: CalendarDays },
  ],
};

const TOOLS: Group = {
  label: "Tools",
  icon: Wrench,
  to: "/household",
  children: [
    { to: "/household", label: "Household", icon: Users },
    { to: "/margins", label: "Item margins", icon: Tag },
    { to: "/drawer", label: "Cash drawer", icon: Wallet },
    { to: "/tax", label: "Tax set-aside", icon: Percent },
    { to: "/lock", label: "Lock this app", icon: Lock },
  ],
};

const EXPORT: Group = {
  label: "Export",
  icon: Download,
  to: "/export",
  children: [
    { to: "/export?download=csv", label: "Download CSV", icon: FileSpreadsheet },
    { to: "/export?download=pdf", label: "Download PDF", icon: FileText },
  ],
};

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const [mobileOpen, setMobileOpen] = useState(false);
  const monthActive = MONTH.children.some((child) => child.to === pathname);
  const toolsActive = TOOLS.children.some((child) => child.to === pathname);
  const exportActive = pathname === "/export";

  const [monthOpen, setMonthOpen] = useState(monthActive);
  const [toolsOpen, setToolsOpen] = useState(toolsActive);
  const [exportOpen, setExportOpen] = useState(exportActive);

  // Opening a group's page should reveal its children.
  useEffect(() => {
    if (monthActive) setMonthOpen(true);
    if (toolsActive) setToolsOpen(true);
    if (exportActive) setExportOpen(true);
  }, [monthActive, toolsActive, exportActive]);

  // Close the mobile drawer whenever the page changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const leafClass = (active: boolean, indented = false) =>
    [
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
      indented ? "pl-9 text-[13px]" : "",
      active ? "border-l-2 border-foreground -ml-[2px]" : "border-l-2 border-transparent -ml-[2px]",
      active
        ? "font-semibold text-foreground"
        : "text-muted-foreground hover:text-foreground",
    ].join(" ");

  const nav = (
    <nav className="flex h-full flex-col gap-0.5">
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <NotebookPen className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">SimpleBooks AI</span>
      </div>

      {TOP.map((item) => (
        <Link key={item.to} to={item.to} className={leafClass(pathname === item.to)}>
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}

      {/* This month group */}
      <button
        type="button"
        onClick={() => setMonthOpen((open) => !open)}
        className={leafClass(false)}
        aria-expanded={monthOpen}
      >
        <MONTH.icon className="size-4 shrink-0" />
        {MONTH.label}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 transition-transform ${
            monthOpen ? "" : "-rotate-90"
          }`}
        />
      </button>
      {monthOpen
        ? MONTH.children.map((child) => (
            <Link key={child.to} to={child.to} className={leafClass(pathname === child.to, true)}>
              {child.label}
            </Link>
          ))
        : null}

      {/* Tools group */}
      <button
        type="button"
        onClick={() => setToolsOpen((open) => !open)}
        className={leafClass(false)}
        aria-expanded={toolsOpen}
      >
        <TOOLS.icon className="size-4 shrink-0" />
        {TOOLS.label}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 transition-transform ${
            toolsOpen ? "" : "-rotate-90"
          }`}
        />
      </button>
      {toolsOpen
        ? TOOLS.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={leafClass(pathname === child.to, true)}
            >
              {child.label}
            </Link>
          ))
        : null}

      {/* Export group */}
      <button
        type="button"
        onClick={() => setExportOpen((open) => !open)}
        className={leafClass(false)}
        aria-expanded={exportOpen}
      >
        <EXPORT.icon className="size-4 shrink-0" />
        {EXPORT.label}
        <ChevronDown
          className={`ml-auto size-4 shrink-0 transition-transform ${
            exportOpen ? "" : "-rotate-90"
          }`}
        />
      </button>
      {exportOpen ? (
        <>
          <Link to="/export" className={leafClass(pathname === "/export", true)}>
            Pick dates
          </Link>
          {EXPORT.children.map((child) => (
            <Link key={child.to} to={child.to} className={leafClass(false, true)}>
              {child.label}
            </Link>
          ))}
        </>
      ) : null}

      <div className="mt-auto border-t pt-2">
        <button type="button" onClick={signOut} className={leafClass(false)}>
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-5 pb-24 pt-8">
      {/* Desktop sidebar */}
      <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r pr-4 lg:block">
        {nav}
      </aside>

      {/* Mobile: header bar + slide-over */}
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <NotebookPen className="size-4" />
            </span>
            <span className="font-bold">SimpleBooks AI</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </Button>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto bg-card p-2 shadow-lg">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </Button>
              </div>
              {nav}
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
