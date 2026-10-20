import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { hasSession } from "@/lib/session";
import { stripLocale } from "@/lib/navigation";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/$locale/dashboard")({
  // Everything under /dashboard needs a valid session
  beforeLoad: async ({ params, location }) => {
    if (!(await hasSession()))
      throw redirect({
        to: "/$locale/sign-in",
        params,
        search: { redirect: stripLocale(location.pathname) },
      });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
