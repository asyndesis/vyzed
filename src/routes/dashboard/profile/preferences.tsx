import { createFileRoute } from "@tanstack/react-router";
import { PreferenceFields } from "@/features/profile/components/preferences";
import {
  SettingsCard,
  SettingsHeader,
} from "@/features/profile/components/settings";

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
