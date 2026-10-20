import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LANGUAGE_SLUG, type SkillKind } from "@/domain/skills";
import { PageTitle } from "@/components/page";
import { PreferenceFields } from "@/components/preferences";
import { type SkillItem, SkillListEditor } from "@/components/skill-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { gqlRequest, graphql, type ResultOf } from "@/lib/gql";
import { MY_LESSONS_KEY } from "@/lib/lessons";
import { Me, meQuery, skillTreeQuery } from "@/lib/queries";

const UpdateProfile = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
    }
  }
`);

export const Route = createFileRoute("/dashboard/profile")({
  loader: ({ context }) => context.queryClient.ensureQueryData(skillTreeQuery),
  head: () => ({ meta: [{ title: "Profile · Vyzed" }] }),
  component: ProfilePage,
});

type MeData = NonNullable<ResultOf<typeof Me>["me"]>;

const skillsOf = (me: MeData, kind: SkillKind): SkillItem[] =>
  me.skills
    .filter((s) => s.kind === kind)
    .map(({ skillId, proficiency, skill }) => ({
      skillId,
      proficiency,
      skill,
    }));

const toForm = (me: MeData) => ({
  firstName: me.firstName ?? "",
  lastName: me.lastName ?? "",
  bio: me.bio ?? "",
  speaks: skillsOf(me, "speaks"),
  teaches: skillsOf(me, "teaches"),
  learns: skillsOf(me, "learns"),
  price: me.priceAmount ? String(me.priceAmount / 100) : "",
  allowBarter: me.allowBarter,
});

type Form = ReturnType<typeof toForm>;

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-[220px_1fr] md:gap-8">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ProfilePage() {
  const { data } = useSuspenseQuery(meQuery);
  const me = data.me!; // the layout only renders for signed-in users
  const queryClient = useQueryClient();
  const saved = toForm(me);
  const [form, setForm] = useState<Form>(saved);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: (f: Form) =>
      gqlRequest(UpdateProfile, {
        input: {
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          bio: f.bio,
          priceAmount: Math.round((parseFloat(f.price) || 0) * 100),
          allowBarter: f.allowBarter,
          skills: (["speaks", "teaches", "learns"] as const).flatMap((kind) =>
            f[kind].map((s) => ({
              skillId: s.skillId,
              proficiency: s.proficiency,
              kind,
            })),
          ),
        },
      }),
    onSuccess: async () => {
      // Teacher listings and lesson cards show my name too
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: [MY_LESSONS_KEY] }),
        queryClient.invalidateQueries({ queryKey: ["TeacherList"] }),
      ]);
      // Reset to what the server now has, so the form is clean again
      const fresh = queryClient.getQueryData(meQuery.queryKey)?.me;
      if (fresh) setForm(toForm(fresh));
      toast.success("Profile saved");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 pb-24">
      <PageTitle
        title="Profile"
        description="How others see you on Vyzed."
        actions={
          saved.teaches.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/teachers/$id" params={{ id: me.id }}>
                View public profile <ExternalLink />
              </Link>
            </Button>
          )
        }
      />

      <Card title="About you" description="Your name and a short intro.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={4}
            value={form.bio}
            placeholder="What do you love teaching? What are you trying to learn?"
            onChange={(e) => set({ bio: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Only your last initial is shown publicly.
          </p>
        </div>
      </Card>

      <Card title="Languages" description="Languages you can hold a lesson in.">
        <SkillListEditor
          value={form.speaks}
          onChange={(speaks) => set({ speaks })}
          category={LANGUAGE_SLUG}
          addLabel="Add language"
          emptyText="No languages yet."
        />
      </Card>

      <Card
        title="Teaching"
        description="What you can teach and what you charge."
      >
        <SkillListEditor
          value={form.teaches}
          onChange={(teaches) => set({ teaches })}
          emptyText="Add a skill to appear in the teacher directory."
        />
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Hourly rate (€)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              placeholder="0 = free"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
            />
          </div>
          <label className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Open to swaps</p>
              <p className="text-xs text-muted-foreground">
                Trade lessons instead of money
              </p>
            </div>
            <Switch
              checked={form.allowBarter}
              onCheckedChange={(allowBarter) => set({ allowBarter })}
            />
          </label>
        </div>
      </Card>

      <Card
        title="Learning"
        description="Skills you want to pick up. Used for swaps."
      >
        <SkillListEditor
          value={form.learns}
          onChange={(learns) => set({ learns })}
          emptyText="Nothing yet."
        />
      </Card>

      <Card
        title="Preferences"
        description="Language and appearance. Saved instantly on this device."
      >
        <PreferenceFields />
      </Card>

      {(dirty || save.isPending) && (
        <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border bg-background py-2 pr-2 pl-5 shadow-lg">
            <span className="text-sm">Unsaved changes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setForm(saved)}
              disabled={save.isPending}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => save.mutate(form)}
              disabled={save.isPending}
            >
              {save.isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
