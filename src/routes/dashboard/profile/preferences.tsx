import { createFileRoute } from "@tanstack/react-router";
import { PreferenceFields } from "@/features/profile/components/preferences";
import { SettingsHeader } from "@/features/profile/components/settings";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card>
        <CardContent className="flex flex-col gap-6">
          <PreferenceFields />
        </CardContent>
      </Card>
    </>
  );
}
