import { createFileRoute } from "@tanstack/react-router";
import { useProfileForm } from "@/components/profile-form";
import { Field, SettingsCard, SettingsHeader } from "@/components/settings";
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
      <SettingsCard footer={footer()}>
        <Field label="Wants to learn">
          <SkillListEditor
            value={form.learns}
            onChange={(learns) => set({ learns })}
            emptyText="Nothing yet."
          />
        </Field>
      </SettingsCard>
    </>
  );
}
