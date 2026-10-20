import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { hasSession } from "@/lib/session";
import { PublicShell } from "@/components/public-shell";
import { PitchPoints, SplitLayout } from "@/components/split-layout";

const text = (v) => (v == null || v === "" ? undefined : String(v));

export const Route = createFileRoute("/{-$locale}/_login")({
  // Search params used by the auth forms
  validateSearch: (search) => ({
    redirect: text(search.redirect),
    token: text(search.token),
    error: text(search.error),
    reset: text(search.reset),
  }),
  beforeLoad: async () => {
    if (await hasSession()) throw redirect({ to: "/{-$locale}/dashboard" });
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
