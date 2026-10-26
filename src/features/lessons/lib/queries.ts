// My lessons, seen from my side: which role I play, which status counts, and how they group
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData, useRouteContext } from "@tanstack/react-router";
import type { LessonStatus } from "@/features/lessons/lib/rules";
import { gqlQuery, graphql, type ResultOf } from "@/lib/gql";

export const MY_LESSONS_KEY = "MyLessons";

const MyLessons = graphql(`
  query MyLessons {
    myLessons {
      id
      startTime
      endTime
      status
      proficiency
      teacherId
      teacher {
        id
        firstName
        lastInitial
        image
      }
      skill {
        id
        name
        framework
      }
      enrollments {
        id
        status
        paymentType
        teacherPaidAt
        studentPaidAt
        student {
          id
          firstName
          lastInitial
          image
        }
      }
    }
  }
`);

export const myLessonsQuery = gqlQuery(MyLessons);

type Lesson = ResultOf<typeof MyLessons>["myLessons"][number];

export type LessonItem = {
  lesson: Lesson;
  role: "teacher" | "student";
  // Teachers act on the lesson, students on their own enrollment
  status: LessonStatus;
  enrollment: Lesson["enrollments"][number] | undefined;
  other: Lesson["teacher"] | undefined;
  past: boolean;
  myPaid: boolean;
  theirPaid: boolean;
  needsAction: boolean;
};

const ACTIVE: LessonStatus[] = ["REQUESTED", "CONFIRMED", "REVISED"];

// `now` comes from the loader so the server render and hydration agree
export function toItems(
  lessons: readonly Lesson[],
  viewerId: string,
  now: number,
): LessonItem[] {
  return lessons.map((lesson) => {
    const role = lesson.teacherId === viewerId ? "teacher" : "student";
    const enrollment = lesson.enrollments[0];
    const status =
      role === "teacher"
        ? lesson.status
        : (enrollment?.status ?? lesson.status);
    const past = new Date(lesson.endTime).getTime() <= now;
    const teacherPaid = !!enrollment?.teacherPaidAt;
    const studentPaid = !!enrollment?.studentPaidAt;
    const myPaid = role === "teacher" ? teacherPaid : studentPaid;
    const theirPaid = role === "teacher" ? studentPaid : teacherPaid;
    const needsAction =
      (role === "teacher" && status === "REQUESTED" && !past) ||
      (role === "student" && status === "REVISED" && !past) ||
      // After the lesson: confirm payment, then (teacher) complete it
      (status === "CONFIRMED" &&
        past &&
        !!enrollment &&
        (!myPaid || (role === "teacher" && theirPaid)));
    return {
      lesson,
      role,
      status,
      enrollment,
      other: role === "teacher" ? enrollment?.student : lesson.teacher,
      past,
      myPaid,
      theirPaid,
      needsAction,
    };
  });
}

const start = (i: LessonItem) => new Date(i.lesson.startTime).getTime();

export function groupLessons(items: LessonItem[]) {
  const byStart = (a: LessonItem, b: LessonItem) => start(a) - start(b);
  return {
    action: items.filter((i) => i.needsAction).sort(byStart),
    upcoming: items
      .filter((i) => !i.needsAction && !i.past && ACTIVE.includes(i.status))
      .sort(byStart),
    past: items
      .filter((i) => !i.needsAction && (i.past || !ACTIVE.includes(i.status)))
      .sort((a, b) => byStart(b, a)),
  };
}

export type LessonGroups = ReturnType<typeof groupLessons>;

// For pages under /dashboard: the layout loader already fetched the lessons and `now`
export function useMyLessons() {
  const { viewer } = useRouteContext({ from: "/dashboard" });
  const now = useLoaderData({ from: "/dashboard", select: (d) => d.now });
  const { data } = useSuspenseQuery(myLessonsQuery);
  const items = toItems(data.myLessons, viewer.id, now);
  return { items, groups: groupLessons(items), now };
}
