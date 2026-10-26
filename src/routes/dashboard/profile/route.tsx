import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PROFILE_PAGES } from "@/components/app-shell";
import { SettingsNav } from "@/features/profile/settings";
import { useSidebar } from "@/components/ui/sidebar";
import { skillTreeQuery } from "@/features/skills/queries";

export const Route = createFileRoute("/dashboard/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(skillTreeQuery),
  head: () => ({ meta: [{ title: "Profile · Vyzed" }] }),
  component: ProfileLayout,
});

// The sub-pages live in the sidebar under Profile; a collapsed (icon-only) sidebar
// can't show them, so the page carries its own tabs then
function ProfileLayout() {
  const { state, isMobile } = useSidebar();
  return (
    <div className="mx-auto max-w-2xl">
      {state === "collapsed" && !isMobile && (
        <div className="mb-6">
          <SettingsNav items={PROFILE_PAGES} />
        </div>
      )}
      <Outlet />
    </div>
  );
}
