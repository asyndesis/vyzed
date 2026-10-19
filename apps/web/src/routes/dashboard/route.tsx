import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { CalendarClock, CalendarDays, Search, UserRound } from "lucide-react";
import { meQuery } from "~/lib/queries";

export const Route = createFileRoute("/dashboard")({
  // Private pages render on the client only; public pages keep SSR for SEO.
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const me = await context.queryClient.ensureQueryData(meQuery);
    if (!me) throw redirect({ to: "/sign-in", search: { redirect: location.href } });
    if (!me.user.role) throw redirect({ to: "/onboarding" });
    return { me };
  },
  component: DashboardLayout,
});

const linkClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground";
const activeProps = { className: "bg-accent text-foreground font-medium" };

function DashboardLayout() {
  const { me } = Route.useRouteContext();
  const isTeacher = me.user.role === "teacher";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[200px_1fr]">
      <nav className="flex flex-row gap-1 md:flex-col">
        <Link
          to="/dashboard"
          activeOptions={{ exact: true }}
          activeProps={activeProps}
          className={linkClass}
        >
          <CalendarDays className="size-4" /> Lessons
        </Link>
        {isTeacher ? (
          <>
            <Link to="/dashboard/profile" activeProps={activeProps} className={linkClass}>
              <UserRound className="size-4" /> Profile
            </Link>
            <Link to="/dashboard/availability" activeProps={activeProps} className={linkClass}>
              <CalendarClock className="size-4" /> Availability
            </Link>
          </>
        ) : (
          <Link to="/teachers" className={linkClass}>
            <Search className="size-4" /> Find a teacher
          </Link>
        )}
      </nav>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
