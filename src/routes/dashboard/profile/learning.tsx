import { GraduationCap } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, SettingsHeader } from "@/features/profile/components/settings";
import { SkillListEditor } from "@/components/skill-picker";

export const Route = createFileRoute("/dashboard/profile/learning")({
  head: () => ({ meta: [{ title: "Learning · Vyzed" }] }),
  component: LearningPage,
});

function LearningPage() {
  const { form, set, footer } = useProfileForm();
  return (
    <>
      <SettingsHeader
        title="Learning"
        description="Skills you want to pick up. Teachers open to swaps see these."
      />
      <Card>
        <CardContent className="flex flex-col gap-6">
          <Field label="Wants to learn">
            <SkillListEditor
              value={form.learns}
              onChange={(learns) => set({ learns })}
              icon={GraduationCap}
              emptyTitle="Nothing to learn yet"
              emptyDescription="Pick skills you want to learn. Teachers open to swaps will see them."
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-between gap-4">{footer()}</CardFooter>
      </Card>
    </>
  );
}
