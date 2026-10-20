import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { PitchPoints, SplitLayout } from "@/components/split-layout";

export const Route = createFileRoute("/_public/_auth")({
  // Search params the auth forms read
  validateSearch: z.object({
    redirect: z.string().optional(),
    token: z.string().optional(),
    error: z.string().optional(),
    reset: z.boolean().optional(),
  }),
  beforeLoad: ({ context }) => {
    if (context.viewer) throw redirect({ to: "/dashboard" });
  },
  component: () => (
    <SplitLayout
      aside={
        <>
          <h2 className="text-4xl leading-tight font-semibold">
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
  ),
});
