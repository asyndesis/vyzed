import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { hasSession } from "@/lib/session";
import { PublicShell } from "@/components/public-shell";
import { PitchPoints, SplitLayout } from "@/components/split-layout";

export const Route = createFileRoute("/$locale/_login")({
  beforeLoad: async ({ params }) => {
    if (await hasSession()) throw redirect({ to: "/$locale/dashboard", params });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <PublicShell>
      <SplitLayout
        aside={
          <>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight">
              Learn from people,
              <br />
              <span className="text-muted-foreground">not playlists.</span>
            </h2>
            <PitchPoints />
          </>
        }
      >
        <Outlet />
      </SplitLayout>
    </PublicShell>
  );
}
