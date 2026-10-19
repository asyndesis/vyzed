import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { teacherProfileInput } from "@vyzed/shared";
import { Button } from "@vyzed/ui/components/button";
import { Input } from "@vyzed/ui/components/input";
import { Label } from "@vyzed/ui/components/label";
import { Skeleton } from "@vyzed/ui/components/skeleton";
import { Textarea } from "@vyzed/ui/components/textarea";
import { type FormEvent, useState } from "react";
import { api, call, type TeacherDto } from "~/lib/api";
import { browserTimeZone } from "~/lib/format";

const profileQuery = {
  queryKey: ["teacher", "profile"],
  queryFn: () => call(api.teacher.profile.$get()),
};

export const Route = createFileRoute("/dashboard/profile")({
  beforeLoad: ({ context }) => {
    if (context.me.user.role !== "teacher") throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Profile · Vyzed" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data, isPending } = useQuery(profileQuery);
  if (isPending) return <Skeleton className="h-96 w-full" />;
  return <ProfileForm initial={data?.profile ?? null} />;
}

const splitList = (v: FormDataEntryValue | null) =>
  (typeof v === "string" ? v : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function ProfileForm({ initial }: { initial: TeacherDto | null }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (json: ReturnType<typeof teacherProfileInput.parse>) =>
      call(api.teacher.profile.$put({ json })),
    onSuccess: (res) => queryClient.setQueryData(profileQuery.queryKey, res),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = teacherProfileInput.safeParse({
      displayName: f.get("displayName"),
      headline: f.get("headline"),
      bio: f.get("bio"),
      subjects: splitList(f.get("subjects")),
      languages: splitList(f.get("languages")),
      hourlyRateCents: Math.round(Number(f.get("hourlyRate")) * 100),
      currency: f.get("currency"),
      timezone: f.get("timezone"),
      published: f.get("published") === "on",
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return setError(issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid input");
    }
    setError(null);
    save.mutate(parsed.data);
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher profile</h1>
        {initial?.published && (
          <Link
            to="/teachers/$teacherId"
            params={{ teacherId: initial.id }}
            className="text-sm underline"
          >
            View public page
          </Link>
        )}
      </div>
      <Field label="Display name" name="displayName" defaultValue={initial?.displayName} required />
      <Field
        label="Headline"
        name="headline"
        defaultValue={initial?.headline}
        placeholder="Certified Spanish tutor with 8 years of experience"
      />
      <div className="grid gap-2">
        <Label htmlFor="bio">About you</Label>
        <Textarea id="bio" name="bio" rows={6} defaultValue={initial?.bio} />
      </div>
      <Field
        label="Subjects (comma separated)"
        name="subjects"
        defaultValue={initial?.subjects.join(", ")}
        placeholder="Spanish, Conversation"
      />
      <Field
        label="Languages you speak (comma separated)"
        name="languages"
        defaultValue={initial?.languages.join(", ")}
        placeholder="English, Spanish"
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Hourly rate"
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial ? String(initial.hourlyRateCents / 100) : "25"}
          required
        />
        <Field
          label="Currency"
          name="currency"
          defaultValue={initial?.currency ?? "USD"}
          maxLength={3}
        />
      </div>
      <Field
        label="Time zone"
        name="timezone"
        defaultValue={initial?.timezone ?? browserTimeZone()}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} />
        Show my profile in search
      </label>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
        {save.isSuccess && <span className="text-sm text-green-600">Saved</span>}
      </div>
      {(error ?? save.error) && (
        <p className="text-sm text-destructive">{error ?? save.error?.message}</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<"input">) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
