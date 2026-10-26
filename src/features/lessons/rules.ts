// Lesson rules shared by the server (enforcement) and the UI (which buttons to show).

export const LESSON_STATUSES = [
  "REQUESTED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REVISED",
] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const PAYMENT_TYPES = ["CASH", "BARTER", "FREE", "CREDIT"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const LESSON_MINUTES = 60;

// Teachers move the lesson
export const TEACHER_TRANSITIONS: Record<
  LessonStatus,
  readonly LessonStatus[]
> = {
  REQUESTED: ["CONFIRMED", "CANCELLED", "REVISED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "REVISED"],
  COMPLETED: [],
  CANCELLED: ["REVISED"],
  REVISED: ["CANCELLED"],
};

// Students move their own enrollment
export const STUDENT_TRANSITIONS: Record<
  LessonStatus,
  readonly LessonStatus[]
> = {
  REQUESTED: ["CANCELLED"], // withdraw
  CONFIRMED: ["CANCELLED"],
  CANCELLED: ["REQUESTED"], // ask again
  REVISED: ["CONFIRMED", "CANCELLED"], // accept or reject the teacher's change
  COMPLETED: [],
};

export const canTransition = (
  role: "teacher" | "student",
  from: LessonStatus,
  to: LessonStatus,
) =>
  (role === "teacher" ? TEACHER_TRANSITIONS : STUDENT_TRANSITIONS)[
    from
  ].includes(to);

// A lesson can only be completed once both sides confirmed payment
export const isSettled = (e: {
  teacherPaidAt: Date | string | null;
  studentPaidAt: Date | string | null;
}) => !!e.teacherPaidAt && !!e.studentPaidAt;
