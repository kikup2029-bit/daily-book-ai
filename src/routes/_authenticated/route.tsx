import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LockGate } from "@/components/lock-gate";
import { AppTopNav } from "@/components/app-topnav";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <LockGate>
      <AppTopNav>
        <Outlet />
      </AppTopNav>
    </LockGate>
  ),
});
