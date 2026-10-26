import { createFileRoute } from "@tanstack/react-router";
import { BIO_MAX } from "@/features/profile/lib/rules";
import { LANGUAGE_SLUG } from "@/features/skills/lib/rules";
import { useProfileForm } from "@/features/profile/components/profile-form";
import {
  Field,
  SettingsCard,
  SettingsHeader,
} from "@/features/profile/components/settings";
import { SkillListEditor } from "@/features/skills/components/skill-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { fullName } from "@/lib/format";

export const Route = createFileRoute("/dashboard/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { me, form, set, footer } = useProfileForm();

  return (
    <>
      <SettingsHeader
        title="Profile"
        description="Your name, intro and the languages you speak."
      />
      <SettingsCard
        footer={footer("Only your last initial is shown publicly.")}
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            user={{ ...me, firstName: form.firstName, lastName: form.lastName }}
            className="size-16 text-xl"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {fullName({ ...me, ...form })}
            </p>
            <p className="truncate text-sm text-muted-foreground">{me.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor="firstName" label="First name">
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
            />
          </Field>
          <Field htmlFor="lastName" label="Last name">
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
            />
          </Field>
        </div>

        <Field
          htmlFor="bio"
          label="About"
          hint={
            <div className="flex justify-between gap-4">
              <span>What you love teaching and what you're working on.</span>
              <span className="tabular-nums">
                {form.bio.length}/{BIO_MAX}
              </span>
            </div>
          }
        >
          <Textarea
            id="bio"
            rows={5}
            maxLength={BIO_MAX}
            value={form.bio}
            placeholder="I've played guitar for ten years and love helping beginners…"
            onChange={(e) => set({ bio: e.target.value })}
          />
        </Field>

        <Field label="Languages" hint="Languages you can hold a lesson in.">
          <SkillListEditor
            value={form.speaks}
            onChange={(speaks) => set({ speaks })}
            category={LANGUAGE_SLUG}
            addLabel="Add language"
            emptyText="No languages yet."
          />
        </Field>
      </SettingsCard>
    </>
  );
}
