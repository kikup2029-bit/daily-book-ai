import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, NotebookPen } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <NotebookPen className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">SimpleBooks AI</h1>
          <p className="text-sm text-muted-foreground">Your simple daily money log</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      <nav className="mt-4 flex gap-1 rounded-2xl border bg-card p-1 shadow-sm">
        {[
          { to: "/dashboard", label: "Today" },
          { to: "/monthly", label: "This month" },
          { to: "/tools", label: "Tools" },
          { to: "/export", label: "Export" },
        ].map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex-1 rounded-xl px-2 py-2 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
