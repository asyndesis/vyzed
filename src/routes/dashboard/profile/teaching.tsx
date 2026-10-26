import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { priceToCents } from "@/features/profile/rules";
import { useProfileForm } from "@/features/profile/profile-form";
import {
  Field,
  SettingsCard,
  SettingsHeader,
} from "@/features/profile/settings";
import { SkillListEditor } from "@/features/skills/skill-picker";
import { TeacherCardBody } from "@/features/teachers/teacher-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/dashboard/profile/teaching")({
  head: () => ({ meta: [{ title: "Teaching · Vyzed" }] }),
  component: TeachingPage,
});

function TeachingPage() {
  const { me, form, saved, set, footer } = useProfileForm();
  const listed = saved.teaches.length > 0;

  return (
    <>
      <SettingsHeader
        title="Teaching"
        description="What you offer students, and what it costs."
        actions={
          listed && (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link to="/dashboard/teachers/$id" params={{ id: me.id }} />
              }
              nativeButton={false}
            >
              Public profile <ExternalLink />
            </Button>
          )
        }
      />
      <div className="space-y-6">
        <SettingsCard
          footer={footer(
            <Badge variant={listed ? "success" : "outline"}>
              {listed ? "Listed in Find teachers" : "Not listed yet"}
            </Badge>,
          )}
        >
          <Field
            label="Skills"
            hint="Add at least one to appear in Find teachers."
          >
            <SkillListEditor
              value={form.teaches}
              onChange={(teaches) => set({ teaches })}
              emptyText="No skills yet."
            />
          </Field>

          <Field
            htmlFor="price"
            label="Hourly rate"
            hint="Leave empty to teach for free."
          >
            <InputGroup className="max-w-48">
              <InputGroupAddon>
                <InputGroupText>€</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>/ hour</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <label className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Open to swaps</p>
              <p className="text-sm text-muted-foreground">
                Trade lessons for ones you want to learn.
              </p>
            </div>
            <Switch
              checked={form.allowBarter}
              onCheckedChange={(allowBarter) => set({ allowBarter })}
            />
          </label>
        </SettingsCard>

        <div className="space-y-2">
          <p className="text-sm font-medium">Preview</p>
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
            <TeacherCardBody
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
          </div>
          <p className="text-xs text-muted-foreground">
            How students see you in Find teachers.
          </p>
        </div>
      </div>
    </>
  );
}
