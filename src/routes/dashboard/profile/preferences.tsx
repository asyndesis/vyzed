import { createFileRoute } from "@tanstack/react-router";
import { PreferenceFields } from "@/components/preferences";
import { SettingsCard, SettingsHeader } from "@/components/settings";

export const Route = createFileRoute("/dashboard/profile/preferences")({
  head: () => ({ meta: [{ title: "Preferences · Vyzed" }] }),
  component: PreferencesPage,
});

function PreferencesPage() {
  return (
    <>
      <SettingsHeader
        title="Preferences"
        description="Language and appearance. Saved instantly on this device."
      />
      <SettingsCard>
        <PreferenceFields />
      </SettingsCard>
    </>
  );
}
