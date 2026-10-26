import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Presentation } from "lucide-react";
import { useProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field as FieldRoot,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Field, SettingsHeader } from "@/features/profile/components/settings";
import { SkillListEditor } from "@/components/skill-picker";
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
        <Card>
          <CardContent className="flex flex-col gap-6">
            <Field
              label="Skills"
              hint="Add at least one to appear in Find teachers."
            >
              <SkillListEditor
                value={form.teaches}
                onChange={(teaches) => set({ teaches })}
                icon={Presentation}
                emptyTitle="No skills yet"
                emptyDescription="Add what you can teach to appear in Find teachers."
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

            <FieldLabel>
              <FieldRoot orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Open to swaps</FieldTitle>
                  <FieldDescription>
                    Trade lessons for ones you want to learn.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  checked={form.allowBarter}
                  onCheckedChange={(allowBarter) => set({ allowBarter })}
                />
              </FieldRoot>
            </FieldLabel>
          </CardContent>
          <CardFooter className="justify-between gap-4">
            {footer(
              <Badge variant={listed ? "secondary" : "outline"}>
                {listed ? "Listed in Find teachers" : "Not listed yet"}
              </Badge>,
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
