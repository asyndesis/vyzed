import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { myLessonsQuery } from "@/features/lessons/lib/queries";
import { meQuery } from "@/features/profile/lib/queries";

// The sidebar remembers collapsed/expanded in a cookie; read it so SSR matches
const getSidebarOpen = createServerFn().handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie("sidebar_state") !== "false";
});

export const Route = createFileRoute("/dashboard")({
  // Everything under /dashboard needs a session
  beforeLoad: ({ context, location }) => {
    if (!context.viewer)
      throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    return { viewer: context.viewer };
  },
  // Shared by the shell (badge, user menu) and the pages below
  loader: async ({ context }) => {
    const [sidebarOpen] = await Promise.all([
      getSidebarOpen(),
      context.queryClient.ensureQueryData(myLessonsQuery),
      context.queryClient.ensureQueryData(meQuery),
    ]);
    // One clock for grouping lessons, identical on the server and in the browser
    return { sidebarOpen, now: Date.now() };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { sidebarOpen } = Route.useLoaderData();
  return (
    <AppShell defaultOpen={sidebarOpen}>
      <Outlet />
    </AppShell>
  );
}
