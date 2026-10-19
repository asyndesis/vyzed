import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { type AvailabilityInput, availabilityInput, type WeeklyRule } from "@vyzed/shared";
import { Button } from "@vyzed/ui/components/button";
import { Input } from "@vyzed/ui/components/input";
import { Label } from "@vyzed/ui/components/label";
import { Skeleton } from "@vyzed/ui/components/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, call } from "~/lib/api";
import { browserTimeZone, minutesToTime, timeToMinutes } from "~/lib/format";

const availabilityQuery = {
  queryKey: ["teacher", "availability"],
  queryFn: () => call(api.teacher.availability.$get()),
};

export const Route = createFileRoute("/dashboard/availability")({
  beforeLoad: ({ context }) => {
    if (context.me.user.role !== "teacher") throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Availability · Vyzed" }] }),
  component: AvailabilityPage,
});

// Monday-first display order; values are JS weekdays (0 = Sunday).
const WEEKDAYS = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [0, "Sunday"],
] as const;

function AvailabilityPage() {
  const { data, isPending } = useQuery(availabilityQuery);
  if (isPending) return <Skeleton className="h-96 w-full" />;
  return (
    <AvailabilityEditor
      initial={data?.availability ?? { timezone: browserTimeZone(), rules: [] }}
    />
  );
}

function AvailabilityEditor({ initial }: { initial: AvailabilityInput }) {
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState(initial.timezone);
  const [rules, setRules] = useState<WeeklyRule[]>(initial.rules);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (json: AvailabilityInput) => call(api.teacher.availability.$put({ json })),
    onSuccess: (res) => queryClient.setQueryData(availabilityQuery.queryKey, res),
  });

  const update = (index: number, patch: Partial<WeeklyRule>) =>
    setRules((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  function onSave() {
    const parsed = availabilityInput.safeParse({ timezone, rules });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid availability");
    setError(null);
    save.mutate(parsed.data);
  }

  return (
    <div className="grid max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly availability</h1>
        <p className="text-sm text-muted-foreground">
          Learners can book any open time inside these windows. Times are in your time zone.
        </p>
      </div>
      <div className="grid max-w-xs gap-2">
        <Label htmlFor="tz">Time zone</Label>
        <Input id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
      </div>

      <div className="grid gap-4">
        {WEEKDAYS.map(([weekday, label]) => {
          const dayRules = rules
            .map((r, i) => [r, i] as const)
            .filter(([r]) => r.weekday === weekday);
          return (
            <div key={weekday} className="flex flex-wrap items-start gap-4 border-b pb-4">
              <div className="w-28 pt-2 text-sm font-medium">{label}</div>
              <div className="grid grow gap-2">
                {dayRules.length === 0 && (
                  <span className="pt-2 text-sm text-muted-foreground">Unavailable</span>
                )}
                {dayRules.map(([rule, i]) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="time"
                      step={1800}
                      className="w-32"
                      value={minutesToTime(rule.startMinute)}
                      onChange={(e) => update(i, { startMinute: timeToMinutes(e.target.value) })}
                    />
                    <span>–</span>
                    <Input
                      type="time"
                      step={1800}
                      className="w-32"
                      value={minutesToTime(rule.endMinute % 1440)}
                      onChange={(e) =>
                        update(i, { endMinute: timeToMinutes(e.target.value) || 1440 })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove window"
                      onClick={() => setRules((rs) => rs.filter((_, j) => j !== i))}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRules((rs) => [...rs, { weekday, startMinute: 9 * 60, endMinute: 17 * 60 }])
                }
              >
                <Plus /> Add
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save availability"}
        </Button>
        {save.isSuccess && <span className="text-sm text-green-600">Saved</span>}
      </div>
      {(error ?? save.error) && (
        <p className="text-sm text-destructive">{error ?? save.error?.message}</p>
      )}
    </div>
  );
}
