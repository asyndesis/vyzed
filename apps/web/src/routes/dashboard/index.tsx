import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@vyzed/ui/components/badge";
import { Button } from "@vyzed/ui/components/button";
import { Skeleton } from "@vyzed/ui/components/skeleton";
import { api, type BookingDto, call } from "~/lib/api";
import { formatDateTime, formatPrice } from "~/lib/format";
import { bookingsQuery } from "~/lib/queries";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Lessons · Vyzed" }] }),
  component: Lessons,
});

const statusVariant = {
  pending: "outline",
  confirmed: "default",
  cancelled: "secondary",
  completed: "secondary",
} as const;

function Lessons() {
  const { data, isPending, error } = useQuery(bookingsQuery);
  const [now] = useState(Date.now);

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (error) return <p className="text-destructive">{error.message}</p>;

  const upcoming = data.bookings.filter((b) => new Date(b.endUtc).getTime() >= now);
  const past = data.bookings.filter((b) => new Date(b.endUtc).getTime() < now);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Upcoming lessons</h1>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">Nothing scheduled yet.</p>
        ) : (
          <ul className="grid gap-3">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} now={now} />
            ))}
          </ul>
        )}
      </div>
      {past.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent</h2>
          <ul className="grid gap-3 opacity-70">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} now={now} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking: b, now }: { booking: BookingDto; now: number }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: (status: "confirmed" | "cancelled") =>
      call(api.bookings[":id"].$patch({ param: { id: b.id }, json: { status } })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsQuery.queryKey }),
  });
  const other = b.viewerRole === "teacher" ? b.learner : b.teacher;
  const active = b.status === "pending" || b.status === "confirmed";
  const upcoming = new Date(b.startUtc).getTime() > now;

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
      <div className="grow">
        <div className="font-medium">{formatDateTime(new Date(b.startUtc))}</div>
        <div className="text-sm text-muted-foreground">
          {b.viewerRole === "teacher" ? "with learner" : "with"} {other.name} ·{" "}
          {formatPrice(b.priceCents, b.currency)}
        </div>
        {b.note && <div className="mt-1 text-sm italic">“{b.note}”</div>}
      </div>
      <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
      {active && upcoming && (
        <div className="flex gap-2">
          {b.viewerRole === "teacher" && b.status === "pending" && (
            <Button
              size="sm"
              disabled={update.isPending}
              onClick={() => update.mutate("confirmed")}
            >
              Confirm
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={update.isPending}
            onClick={() => update.mutate("cancelled")}
          >
            Cancel
          </Button>
        </div>
      )}
      {update.error && <p className="w-full text-sm text-destructive">{update.error.message}</p>}
    </li>
  );
}
