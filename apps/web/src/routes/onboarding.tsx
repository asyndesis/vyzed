import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { Role } from "@vyzed/shared";
import { GraduationCap, Presentation } from "lucide-react";
import { api, call } from "~/lib/api";
import { meQuery } from "~/lib/queries";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(meQuery);
    if (!me) throw redirect({ to: "/sign-in" });
    if (me.user.role) throw redirect({ to: "/dashboard" });
  },
  component: Onboarding,
});

const options = [
  {
    role: "learner",
    icon: GraduationCap,
    title: "I want to learn",
    body: "Find teachers and book lessons.",
  },
  {
    role: "teacher",
    icon: Presentation,
    title: "I want to teach",
    body: "Create a profile and get booked.",
  },
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setRole = useMutation({
    mutationFn: (role: Role) => call(api.me.role.$post({ json: { role } })),
    onSuccess: async (_, role) => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      await navigate({ to: role === "teacher" ? "/dashboard/profile" : "/teachers" });
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <h1 className="mb-2 text-3xl font-bold">Welcome to Vyzed</h1>
      <p className="mb-8 text-muted-foreground">How will you use Vyzed?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map(({ role, icon: Icon, title, body }) => (
          <button
            key={role}
            type="button"
            disabled={setRole.isPending}
            onClick={() => setRole.mutate(role)}
            className="rounded-xl border p-6 text-left transition hover:border-foreground disabled:opacity-50"
          >
            <Icon className="mb-3 size-8" />
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{body}</div>
          </button>
        ))}
      </div>
      {setRole.error && <p className="mt-4 text-sm text-destructive">{setRole.error.message}</p>}
    </div>
  );
}
