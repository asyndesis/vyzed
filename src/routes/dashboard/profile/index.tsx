import { Languages } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { BIO_MAX } from "@/features/profile/lib/rules";
import { LANGUAGE_SLUG } from "@/lib/skills";
import { useProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, SettingsHeader } from "@/features/profile/components/settings";
import { SkillListEditor } from "@/components/skill-picker";
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
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              user={{
                ...me,
                firstName: form.firstName,
                lastName: form.lastName,
              }}
              className="size-16 text-xl"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {fullName({ ...me, ...form })}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {me.email}
              </p>
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
              icon={Languages}
              emptyTitle="No languages yet"
              emptyDescription="Add the languages you can teach and learn in."
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-between gap-4">
          {footer("Only your last initial is shown publicly.")}
        </CardFooter>
      </Card>
    </>
  );
}
