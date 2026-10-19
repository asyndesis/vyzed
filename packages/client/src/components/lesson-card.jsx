"use client";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, Loader2, X, CircleDollarSign, Repeat } from "lucide-react";
import { LessonStatus } from "@vyzed/prisma/enums";
import {
  CHANGE_ENROLLMENT_STATUS,
  CHANGE_LESSON_STATUS,
  MY_LESSONS,
  SET_PAID,
} from "@/lib/graphql";
import { fullName, timeRange, friendlyDay, isPastDate } from "@/lib/format";
import { renderProficiency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

const STATUS = {
  REQUESTED: { label: "Requested", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "primary" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  REVISED: { label: "Revised", variant: "secondary" },
};

export function StatusPill({ status }) {
  const s = STATUS[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function useAction(mutation, successMsg) {
  const [run, { loading }] = useMutation(mutation, {
    refetchQueries: [MY_LESSONS],
    awaitRefetchQueries: true,
  });
  const go = (variables) =>
    run({ variables })
      .then(() => successMsg && toast.success(successMsg))
      .catch((e) => toast.error(e.message));
  return [go, loading];
}

function ActionButton({ onClick, loading, icon: Icon, children, ...props }) {
  return (
    <Button size="sm" onClick={onClick} disabled={loading} {...props}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </Button>
  );
}

// role: "teacher" | "student"
export function LessonCard({ lesson, role }) {
  const enrollment = lesson.enrollments[0];
  const other = role === "teacher" ? enrollment?.student : lesson.teacher;
  const status = role === "teacher" ? lesson.status : enrollment?.status ?? lesson.status;
  const start = new Date(lesson.startTime);
  const past = isPastDate(lesson.endTime);

  const [setLesson, lessonBusy] = useAction(CHANGE_LESSON_STATUS);
  const [setEnrollment, enrollBusy] = useAction(CHANGE_ENROLLMENT_STATUS);
  const [setPaid, paidBusy] = useAction(SET_PAID, "Payment updated");

  const myPaid =
    role === "teacher" ? enrollment?.teacherPaymentAt : enrollment?.studentPaymentAt;
  const theirPaid =
    role === "teacher" ? enrollment?.studentPaymentAt : enrollment?.teacherPaymentAt;
  const isBarter = enrollment?.paymentType === "BARTER";

  const actions = [];
  if (role === "teacher") {
    if (status === LessonStatus.REQUESTED) {
      actions.push(
        <ActionButton key="c" icon={Check} loading={lessonBusy}
          onClick={() => setLesson({ lessonId: lesson.id, status: "CONFIRMED" })}>
          Accept
        </ActionButton>,
        <ActionButton key="d" icon={X} variant="outline" loading={lessonBusy}
          onClick={() => setLesson({ lessonId: lesson.id, status: "CANCELLED" })}>
          Decline
        </ActionButton>,
      );
    }
    if (status === LessonStatus.CONFIRMED && past && myPaid && theirPaid) {
      actions.push(
        <ActionButton key="done" icon={Check} loading={lessonBusy}
          onClick={() => setLesson({ lessonId: lesson.id, status: "COMPLETED" })}>
          Mark complete
        </ActionButton>,
      );
    }
    if (status === LessonStatus.CONFIRMED && !past) {
      actions.push(
        <ActionButton key="x" variant="ghost" loading={lessonBusy}
          onClick={() => setLesson({ lessonId: lesson.id, status: "CANCELLED" })}>
          Cancel
        </ActionButton>,
      );
    }
  } else if (enrollment) {
    if (status === LessonStatus.REVISED) {
      actions.push(
        <ActionButton key="ok" icon={Check} loading={enrollBusy}
          onClick={() => setEnrollment({ enrollmentId: enrollment.id, status: "CONFIRMED" })}>
          Accept changes
        </ActionButton>,
      );
    }
    if ([LessonStatus.REQUESTED, LessonStatus.CONFIRMED, LessonStatus.REVISED].includes(status) && !past) {
      actions.push(
        <ActionButton key="x" variant="ghost" loading={enrollBusy}
          onClick={() => setEnrollment({ enrollmentId: enrollment.id, status: "CANCELLED" })}>
          {status === LessonStatus.REQUESTED ? "Withdraw" : "Cancel"}
        </ActionButton>,
      );
    }
    if (status === LessonStatus.CANCELLED && !past) {
      actions.push(
        <ActionButton key="r" icon={Repeat} variant="outline" loading={enrollBusy}
          onClick={() => setEnrollment({ enrollmentId: enrollment.id, status: "REQUESTED" })}>
          Request again
        </ActionButton>,
      );
    }
  }

  // Both sides confirm payment (or a settled swap) once the lesson happened
  const showPayment = enrollment && status === LessonStatus.CONFIRMED && past;

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30 sm:flex-row sm:items-center">
      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border bg-background py-1.5 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {format(start, "MMM")}
        </span>
        <span className="text-xl font-bold leading-none">{format(start, "d")}</span>
        <span className="text-[10px] text-muted-foreground">{format(start, "EEE")}</span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar user={other} className="h-9 w-9" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {lesson.skill.name}
              <span className="font-normal text-muted-foreground">
                {" "}
                {role === "teacher" ? "with" : "from"} {fullName(other)}
              </span>
            </span>
            <StatusPill status={status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {friendlyDay(start)} · {timeRange(lesson.startTime, lesson.endTime)} ·{" "}
            {renderProficiency({ proficiency: lesson.proficiency, framework: lesson.skill.framework })}
            {isBarter && " · Skill swap"}
          </p>
        </div>
      </div>

      {(actions.length > 0 || showPayment) && (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {showPayment && (
            <ActionButton
              icon={CircleDollarSign}
              variant={myPaid ? "secondary" : "outline"}
              loading={paidBusy}
              onClick={() => setPaid({ enrollmentId: enrollment.id, isPaid: !myPaid })}
            >
              {isBarter
                ? myPaid ? "Swap settled ✓" : "Mark swap settled"
                : myPaid
                  ? role === "teacher" ? "Received ✓" : "Paid ✓"
                  : role === "teacher" ? "Mark received" : "Mark paid"}
            </ActionButton>
          )}
          {actions}
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
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <SkeletonText className="w-56 max-w-full" />
          <SkeletonText className="mt-0.5 w-40 max-w-full text-sm" />
        </div>
      </div>
    </div>
  );
}
