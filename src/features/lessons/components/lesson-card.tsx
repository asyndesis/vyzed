import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { format } from "date-fns";
import { Check, CircleDollarSign, Loader2, Repeat, X } from "lucide-react";
import { toast } from "sonner";
import {
  canTransition,
  isSettled,
  type LessonStatus,
} from "@/features/lessons/lib/rules";
import { levelLabel } from "@/features/skills/lib/rules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { friendlyDay, fullName, timeRange } from "@/lib/format";
import { gqlRequest, graphql } from "@/lib/gql";
import {
  type LessonItem,
  MY_LESSONS_KEY,
} from "@/features/lessons/lib/queries";

const STATUS: Record<
  LessonStatus,
  {
    label: string;
    variant: "warning" | "default" | "secondary" | "success" | "destructive";
  }
> = {
  REQUESTED: { label: "Requested", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  REVISED: { label: "Revised", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function StatusBadge({ status }: { status: LessonStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

const SetLessonStatus = graphql(`
  mutation SetLessonStatus($lessonId: ID!, $status: LessonStatus!) {
    setLessonStatus(lessonId: $lessonId, status: $status) {
      id
    }
  }
`);

const SetEnrollmentStatus = graphql(`
  mutation SetEnrollmentStatus($enrollmentId: ID!, $status: LessonStatus!) {
    setEnrollmentStatus(enrollmentId: $enrollmentId, status: $status) {
      id
    }
  }
`);

const SetPaid = graphql(`
  mutation SetPaid($enrollmentId: ID!, $paid: Boolean!) {
    setPaid(enrollmentId: $enrollmentId, paid: $paid) {
      id
    }
  }
`);

type Action = {
  key: string;
  label: string;
  icon?: typeof Check;
  variant?: "default" | "outline" | "ghost" | "secondary";
  run: () => Promise<unknown>;
};

// Start date and time depend on the viewer's time zone, so they render in the browser only
function LessonWhen({ item }: { item: LessonItem }) {
  const { lesson } = item;
  return (
    <ClientOnly fallback={<SkeletonText className="mt-0.5 w-40 text-sm" />}>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {friendlyDay(lesson.startTime)} ·{" "}
        {timeRange(lesson.startTime, lesson.endTime)} ·{" "}
        {levelLabel(lesson.proficiency, lesson.skill.framework)}
        {item.enrollment?.paymentType === "BARTER" && " · Skill swap"}
      </p>
    </ClientOnly>
  );
}

export function DateTile({
  date,
  className = "h-16 w-14",
}: {
  date: string;
  className?: string;
}) {
  return (
    <ClientOnly
      fallback={<Skeleton className={`${className} shrink-0 rounded-lg`} />}
    >
      <div
        className={`${className} flex shrink-0 flex-col items-center justify-center rounded-lg border bg-background text-center`}
      >
        <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
          {format(new Date(date), "MMM")}
        </span>
        <span className="text-xl leading-none font-bold">
          {format(new Date(date), "d")}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(date), "EEE")}
        </span>
      </div>
    </ClientOnly>
  );
}

export function LessonCard({ item }: { item: LessonItem }) {
  const queryClient = useQueryClient();
  const { lesson, role, status, enrollment, other, past } = item;

  const mutation = useMutation({
    mutationFn: (a: Action) => a.run(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [MY_LESSONS_KEY] }),
    onError: (e) => toast.error(e.message),
  });

  const teacherMove = (to: LessonStatus) => () =>
    gqlRequest(SetLessonStatus, { lessonId: lesson.id, status: to });
  const studentMove = (to: LessonStatus) => () =>
    gqlRequest(SetEnrollmentStatus, {
      enrollmentId: enrollment!.id,
      status: to,
    });

  const actions: Action[] = [];
  if (role === "teacher") {
    const can = (to: LessonStatus) => canTransition("teacher", status, to);
    if (status === "REQUESTED") {
      if (can("CONFIRMED"))
        actions.push({
          key: "accept",
          label: "Accept",
          icon: Check,
          run: teacherMove("CONFIRMED"),
        });
      if (can("CANCELLED"))
        actions.push({
          key: "decline",
          label: "Decline",
          icon: X,
          variant: "outline",
          run: teacherMove("CANCELLED"),
        });
    }
    if (
      status === "CONFIRMED" &&
      past &&
      can("COMPLETED") &&
      lesson.enrollments.every(isSettled)
    )
      actions.push({
        key: "complete",
        label: "Mark complete",
        icon: Check,
        run: teacherMove("COMPLETED"),
      });
    if (status === "CONFIRMED" && !past && can("CANCELLED"))
      actions.push({
        key: "cancel",
        label: "Cancel",
        variant: "ghost",
        run: teacherMove("CANCELLED"),
      });
  } else if (enrollment) {
    const can = (to: LessonStatus) => canTransition("student", status, to);
    if (status === "REVISED" && can("CONFIRMED"))
      actions.push({
        key: "accept",
        label: "Accept changes",
        icon: Check,
        run: studentMove("CONFIRMED"),
      });
    if (!past && status !== "CANCELLED" && can("CANCELLED"))
      actions.push({
        key: "cancel",
        label: status === "REQUESTED" ? "Withdraw" : "Cancel",
        variant: "ghost",
        run: studentMove("CANCELLED"),
      });
    if (!past && can("REQUESTED"))
      actions.push({
        key: "again",
        label: "Request again",
        icon: Repeat,
        variant: "outline",
        run: studentMove("REQUESTED"),
      });
  }

  // Once a confirmed lesson has happened, both sides confirm payment (or the swap)
  if (enrollment && status === "CONFIRMED" && past) {
    const paid = item.myPaid;
    const label =
      enrollment.paymentType === "BARTER"
        ? paid
          ? "Swap settled"
          : "Mark swap settled"
        : enrollment.paymentType === "CASH"
          ? role === "teacher"
            ? paid
              ? "Payment received"
              : "Mark received"
            : paid
              ? "Paid"
              : "Mark paid"
          : paid
            ? "Lesson confirmed"
            : "Confirm it happened";
    actions.unshift({
      key: "paid",
      label,
      icon: paid ? Check : CircleDollarSign,
      variant: paid ? "secondary" : "outline",
      run: () =>
        gqlRequest(SetPaid, { enrollmentId: enrollment.id, paid: !paid }),
    });
  }

  const busy = mutation.isPending ? mutation.variables?.key : undefined;
  const waitingOnThem =
    enrollment &&
    status === "CONFIRMED" &&
    past &&
    item.myPaid &&
    !item.theirPaid;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      <DateTile date={lesson.startTime} />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {other && <UserAvatar user={other} className="size-9" />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {lesson.skill.name}
              <span className="font-normal text-muted-foreground">
                {" "}
                {role === "teacher" ? "with" : "from"} {fullName(other)}
              </span>
            </span>
            <StatusBadge status={status} />
          </div>
          <LessonWhen item={item} />
          {waitingOnThem && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Waiting for {other?.firstName ?? "them"} to confirm
            </p>
          )}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {actions.map((a) => (
            <Button
              key={a.key}
              size="sm"
              variant={a.variant ?? "default"}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(a)}
            >
              {busy === a.key ? (
                <Loader2 className="animate-spin" />
              ) : (
                a.icon && <a.icon />
              )}
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Mirrors LessonCard's boxes and line heights so the swap doesn't shift anything
export function LessonCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
      <Skeleton className="h-16 w-14 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <SkeletonText className="w-56 max-w-full" />
          <SkeletonText className="mt-0.5 w-40 max-w-full text-sm" />
        </div>
      </div>
    </div>
  );
}
