import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import type { LessonDuration } from "@vyzed/shared";
import { LESSON_DURATIONS } from "@vyzed/shared";
import { Button } from "@vyzed/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@vyzed/ui/components/card";
import { Textarea } from "@vyzed/ui/components/textarea";
import { cn } from "@vyzed/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { api, call, type TeacherDto } from "~/lib/api";
import { browserTimeZone, dayKey, formatDay, formatPrice, formatTime } from "~/lib/format";
import { bookingsQuery, meQuery } from "~/lib/queries";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function BookingPanel({ teacher }: { teacher: TeacherDto }) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { data: me } = useQuery(meQuery);
  const [weekStart, setWeekStart] = useState(startOfToday);
  const [duration, setDuration] = useState<LessonDuration>(60);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const from = weekStart.toISOString();
  const to = new Date(weekStart.getTime() + 7 * DAY_MS).toISOString();
  const slots = useQuery({
    queryKey: ["slots", teacher.id, from, duration],
    queryFn: () =>
      call(
        api.teachers[":id"].slots.$get({
          param: { id: teacher.id },
          query: { from, to, duration: String(duration) },
        }),
      ),
  });

  const days = useMemo(() => {
    const byDay = new Map<string, Date[]>();
    for (let i = 0; i < 7; i++) byDay.set(dayKey(new Date(weekStart.getTime() + i * DAY_MS)), []);
    for (const iso of slots.data?.slots ?? []) {
      const d = new Date(iso);
      byDay.get(dayKey(d))?.push(d);
    }
    return [...byDay.entries()];
  }, [slots.data, weekStart]);

  const book = useMutation({
    mutationFn: () =>
      call(
        api.bookings.$post({
          json: {
            teacherId: teacher.id,
            startUtc: selected!,
            durationMinutes: duration,
            note: note || undefined,
          },
        }),
      ),
    onSuccess: async () => {
      setSelected(null);
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["slots", teacher.id] }),
        queryClient.invalidateQueries({ queryKey: bookingsQuery.queryKey }),
      ]);
    },
  });

  const isOwnProfile = me?.user.id === teacher.id;
  const canGoBack = weekStart > startOfToday();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a lesson</CardTitle>
        <p className="text-xs text-muted-foreground">Times shown in {browserTimeZone()}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex gap-2">
          {LESSON_DURATIONS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={d === duration ? "default" : "outline"}
              onClick={() => {
                setDuration(d);
                setSelected(null);
              }}
            >
              {d} min · {formatPrice((teacher.hourlyRateCents * d) / 60, teacher.currency)}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            size="icon"
            variant="ghost"
            disabled={!canGoBack}
            onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * DAY_MS))}
            aria-label="Previous week"
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm font-medium">Week of {formatDay(weekStart)}</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * DAY_MS))}
            aria-label="Next week"
          >
            <ChevronRight />
          </Button>
        </div>

        {slots.isPending ? (
          <p className="text-sm text-muted-foreground">Loading availability…</p>
        ) : slots.isError ? (
          <p className="text-sm text-destructive">{slots.error.message}</p>
        ) : (
          <div className="grid max-h-96 gap-3 overflow-y-auto">
            {days.map(([key, times]) => (
              <div key={key}>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  {formatDay(new Date(`${key}T12:00:00`))}
                </div>
                {times.length === 0 ? (
                  <div className="text-xs text-muted-foreground/60">No times</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {times.map((t) => {
                      const iso = t.toISOString();
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setSelected(iso)}
                          className={cn(
                            "rounded-md border px-2 py-1 text-xs transition hover:border-foreground",
                            selected === iso && "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {formatTime(t)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selected &&
          (me ? (
            isOwnProfile ? (
              <p className="text-sm text-muted-foreground">This is your own profile.</p>
            ) : (
              <div className="grid gap-2">
                <Textarea
                  placeholder="Anything the teacher should know? (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button disabled={book.isPending} onClick={() => book.mutate()}>
                  {book.isPending
                    ? "Booking…"
                    : `Request ${formatDay(new Date(selected))}, ${formatTime(new Date(selected))}`}
                </Button>
              </div>
            )
          ) : (
            <Button asChild>
              <Link to="/sign-in" search={{ redirect: location.pathname }}>
                Sign in to book
              </Link>
            </Button>
          ))}
        {book.isSuccess && (
          <p className="text-sm text-green-600">Requested! The teacher will confirm shortly.</p>
        )}
        {book.isError && <p className="text-sm text-destructive">{book.error.message}</p>}
      </CardContent>
    </Card>
  );
}
