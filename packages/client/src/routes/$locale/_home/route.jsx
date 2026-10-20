import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";

export const Route = createFileRoute("/$locale/_home")({
  component: () => (
    <PublicShell>
      <Outlet />
    </PublicShell>
  ),
});
