import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  ME,
  UPDATE_STUDENT_PROFILE,
  UPDATE_TEACHER_PROFILE,
  UPDATE_USER,
  UPDATE_USER_PROFILE,
} from "@/lib/graphql";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Loading, PageTitle } from "@/components/empty-state";
import { SkillListEditor } from "@/components/skill-picker";
import { PreferenceFields } from "@/components/preferences";

const LANGUAGE_CATEGORY_ID = "65f000000000000000000000";

const toItems = (list = []) =>
  list.map(({ id, skillId, proficiency, skill }) => ({ id, skillId, proficiency, skill }));
const toInput = (list) => list.map(({ id, skillId, proficiency }) => ({ id, skillId, proficiency }));

const fromMe = (me) => ({
  firstName: me.firstName ?? "",
  lastName: me.lastName ?? "",
  bio: me.userProfile?.bio ?? "",
  languages: toItems(me.userProfile?.languages),
  learning: toItems(me.studentProfile?.skills),
  teaching: toItems(me.teacherProfile?.skills),
  price: me.teacherProfile?.priceAmount ? String(me.teacherProfile.priceAmount / 100) : "",
  allowBarter: !!me.teacherProfile?.allowBarter,
});

function Card({ title, description, children }) {
  return (
    <section className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-[220px_1fr] md:gap-8 md:p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// Real section titles with placeholder fields, so the page keeps its shape
function ProfileSkeleton() {
  const field = (
    <div className="space-y-2">
      <SkeletonText className="w-20 text-sm" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
  return (
    <Loading className="space-y-8">
      <Card title="About you" description="Your name and a short intro.">
        <div className="grid gap-4 sm:grid-cols-2">{field}{field}</div>
        <Skeleton className="h-24 w-full" />
      </Card>
      <Card title="Languages" description="Languages you can hold a lesson in.">{field}</Card>
      <Card title="Teaching" description="What you can teach and what you charge.">{field}</Card>
      <Card title="Learning" description="Skills you want to pick up. Used for swaps.">{field}</Card>
      <Card title="Preferences" description="Language and appearance. Saved instantly on this device.">
        <PreferenceFields />
      </Card>
    </Loading>
  );
}

function ProfilePage() {
  const { me, loading } = useMe();
  const initial = useMemo(() => (me ? fromMe(me) : null), [me]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const opts = { refetchQueries: [ME], awaitRefetchQueries: true };
  const [updateUser] = useMutation(UPDATE_USER);
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);
  const [updateStudent] = useMutation(UPDATE_STUDENT_PROFILE);
  const [updateTeacher] = useMutation(UPDATE_TEACHER_PROFILE, opts);

  if (loading || !form) {
    return (
      <>
        <PageTitle title="Profile" description="How others see you on Vyzed." />
        <ProfileSkeleton />
      </>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const changed = (...keys) =>
    keys.some((k) => JSON.stringify(form[k]) !== JSON.stringify(initial[k]));
  const dirty = changed(...Object.keys(form));

  const save = async () => {
    setSaving(true);
    try {
      const jobs = [];
      if (changed("firstName", "lastName"))
        jobs.push(updateUser({ variables: { id: me.id, input: { firstName: form.firstName, lastName: form.lastName } } }));
      if (changed("bio", "languages"))
        jobs.push(updateUserProfile({ variables: { id: me.userProfile.id, input: { bio: form.bio, languages: toInput(form.languages) } } }));
      if (changed("learning"))
        jobs.push(updateStudent({ variables: { id: me.studentProfile.id, input: { skills: toInput(form.learning) } } }));
      await Promise.all(jobs);
      // Teacher update last and awaits the ME refetch, so the form resets to saved data
      await updateTeacher({
        variables: {
          id: me.teacherProfile.id,
          input: {
            ...(changed("teaching") && { skills: toInput(form.teaching) }),
            priceAmount: Math.round((parseFloat(form.price) || 0) * 100),
            priceCurrency: "EUR",
            allowBarter: form.allowBarter,
          },
        },
      });
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageTitle
        title="Profile"
        description="How others see you on Vyzed."
        actions={
          me.teacherProfile?.skills?.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link to="/{-$locale}/dashboard/teachers/$id" params={{ id: me.id }}>
                View public profile <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )
        }
      />

      <Card title="About you" description="Your name and a short intro.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} />
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
          <p className="text-xs text-muted-foreground">Only your last initial is shown publicly.</p>
        </div>
      </Card>

      <Card title="Languages" description="Languages you can hold a lesson in.">
        <SkillListEditor
          value={form.languages}
          onChange={(languages) => set({ languages })}
          categoryId={LANGUAGE_CATEGORY_ID}
          addLabel="Add language"
          emptyText="No languages yet."
        />
      </Card>

      <Card title="Teaching" description="What you can teach and what you charge.">
        <SkillListEditor
          value={form.teaching}
          onChange={(teaching) => set({ teaching })}
          addLabel="Add skill"
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
              <p className="text-xs text-muted-foreground">Trade lessons instead of money</p>
            </div>
            <Switch checked={form.allowBarter} onCheckedChange={(allowBarter) => set({ allowBarter })} />
          </label>
        </div>
      </Card>

      <Card title="Learning" description="Skills you want to pick up. Used for swaps.">
        <SkillListEditor
          value={form.learning}
          onChange={(learning) => set({ learning })}
          addLabel="Add skill"
          emptyText="Nothing yet."
        />
      </Card>
      <Card title="Preferences" description="Language and appearance. Saved instantly on this device.">
        <PreferenceFields />
      </Card>

      {/* Floating save bar, only while there are unsaved changes */}
      <div
        className={`fixed inset-x-0 bottom-4 z-20 flex justify-center px-4 transition-all duration-200 ${
          dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-full border bg-background/95 py-2 pl-5 pr-2 shadow-lg backdrop-blur">
          <span className="text-sm">Unsaved changes</span>
          <Button variant="ghost" size="sm" onClick={() => setForm(initial)} disabled={saving}>
            Discard
          </Button>
          <Button size="sm" className="rounded-full" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/{-$locale}/dashboard/profile")({ component: ProfilePage });
