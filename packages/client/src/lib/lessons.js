import { isPastDate } from "@/lib/format";

// Flatten teacher + student lessons into one list tagged with my role
export const allLessons = (data) => [
  ...(data?.myLessonsAsTeacher ?? []).map((lesson) => ({ lesson, role: "teacher" })),
  ...(data?.myLessonsAsStudent ?? []).map((lesson) => ({ lesson, role: "student" })),
];

const statusOf = ({ lesson, role }) =>
  role === "teacher" ? lesson.status : lesson.enrollments[0]?.status ?? lesson.status;

// Things I need to act on
export const needsAction = (item) => {
  const s = statusOf(item);
  return item.role === "teacher" ? s === "REQUESTED" : s === "REVISED";
};

export const groupLessons = (data) => {
  const items = allLessons(data);
  const byStart = (a, b) => new Date(a.lesson.startTime) - new Date(b.lesson.startTime);
  const active = (i) => ["REQUESTED", "CONFIRMED", "REVISED"].includes(statusOf(i));
  return {
    action: items.filter(needsAction).sort(byStart),
    upcoming: items
      .filter((i) => active(i) && !needsAction(i) && !isPastDate(i.lesson.endTime))
      .sort(byStart),
    past: items
      .filter((i) => !active(i) || isPastDate(i.lesson.endTime))
      .sort((a, b) => -byStart(a, b)),
  };
};
