import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PROFILE_PAGES } from "@/components/app-shell";
import {
  ProfileFormProvider,
  useProfileForm,
} from "@/features/profile/components/profile-form";
import { SettingsNav } from "@/features/profile/components/settings";
import { priceToCents } from "@/features/profile/lib/rules";
import { TeacherCardView } from "@/features/teachers/components/teacher-card";
import { useSidebar } from "@/components/ui/sidebar";
import { skillTreeQuery } from "@/lib/skill-queries";

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
    <ProfileFormProvider>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {state === "collapsed" && !isMobile && (
            <div className="mb-6">
              <SettingsNav items={PROFILE_PAGES} />
            </div>
          )}
          <Outlet />
        </div>
        <ProfilePreview />
      </div>
    </ProfileFormProvider>
  );
}

// How students see you in Find teachers, updating as you type
function ProfilePreview() {
  const { me, form } = useProfileForm();
  return (
    <aside className="flex h-fit flex-col gap-2 lg:sticky lg:top-6">
      <p className="text-sm font-medium">Preview</p>
      <TeacherCardView
        to="/dashboard/teachers/$id"
        user={{
          id: me.id,
          image: me.image,
          firstName: form.firstName,
          lastInitial: form.lastName.trim()[0] ?? null,
          bio: form.bio.trim(),
          priceAmount: priceToCents(form.price),
          priceCurrency: me.priceCurrency,
          allowBarter: form.allowBarter,
          teaches: form.teaches,
          speaks: form.speaks,
        }}
      />
      <p className="text-xs text-muted-foreground">
        How students see you in Find teachers.
      </p>
    </aside>
  );
}
