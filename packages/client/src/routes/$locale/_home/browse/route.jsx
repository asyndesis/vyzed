import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-shell";

export const Route = createFileRoute("/$locale/_home/browse")({
  component: () => (
    <PublicPage>
      <Outlet />
    </PublicPage>
  ),
});
