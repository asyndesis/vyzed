import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { hasSession } from "@/lib/session";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/{-$locale}/dashboard")({
  // Everything under /dashboard needs a valid session
  beforeLoad: async ({ location }) => {
    if (!(await hasSession()))
      throw redirect({ to: "/{-$locale}/sign-in", search: { redirect: location.href } });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
