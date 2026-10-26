import { describe, expect, it } from "vitest";
import { groupLessons, toItems } from "@/features/lessons/lib/queries";

type Lesson = Parameters<typeof toItems>[0][number];
type Enrollment = Lesson["enrollments"][number];

const now = new Date("2026-01-05T12:00:00Z").getTime();
const FUTURE = {
  startTime: "2026-01-06T10:00:00Z",
  endTime: "2026-01-06T11:00:00Z",
};
const PAST = {
  startTime: "2026-01-04T10:00:00Z",
  endTime: "2026-01-04T11:00:00Z",
};

const lesson = (
  over: Partial<Lesson> = {},
  enrollment: Partial<Enrollment> = {},
): Lesson =>
  ({
    id: "l1",
    ...FUTURE,
    status: "REQUESTED",
    proficiency: 3,
    teacherId: "t",
    teacher: { id: "t", firstName: "Tea", lastInitial: "C", image: null },
    skill: { id: "k", name: "Spanish", framework: "CEFR" },
    enrollments: [
      {
        id: "e1",
        status: "REQUESTED",
        paymentType: "CASH",
        teacherPaidAt: null,
        studentPaidAt: null,
        student: { id: "s", firstName: "Stu", lastInitial: "D", image: null },
        ...enrollment,
      },
    ],
    ...over,
  }) as Lesson;

const item = (l: Lesson, viewer: string) => toItems([l], viewer, now)[0]!;

describe("toItems", () => {
  it("sees the lesson from the viewer's side", () => {
    const l = lesson({ status: "CONFIRMED" }, { status: "REVISED" });
    expect(item(l, "t")).toMatchObject({
      role: "teacher",
      status: "CONFIRMED",
    });
    // Students see their own enrollment's status and the teacher as the other side
    expect(item(l, "s")).toMatchObject({ role: "student", status: "REVISED" });
    expect(item(l, "s").other?.id).toBe("t");
    expect(item(l, "t").other?.id).toBe("s");
  });

  it("asks the teacher to answer a new request, until it's in the past", () => {
    expect(item(lesson(), "t").needsAction).toBe(true);
    expect(item(lesson(), "s").needsAction).toBe(false);
    expect(item(lesson(PAST), "t").needsAction).toBe(false);
  });

  it("asks the student to answer a revision", () => {
    const l = lesson({ status: "REVISED" }, { status: "REVISED" });
    expect(item(l, "s").needsAction).toBe(true);
    expect(item(l, "t").needsAction).toBe(false);
  });

  it("after a confirmed lesson, asks each side to confirm payment", () => {
    const l = lesson({ ...PAST, status: "CONFIRMED" }, { status: "CONFIRMED" });
    expect(item(l, "t").needsAction).toBe(true);
    expect(item(l, "s").needsAction).toBe(true);
  });

  it("then asks only the teacher to complete it once both paid", () => {
    const paid = "2026-01-04T12:00:00Z";
    const l = lesson(
      { ...PAST, status: "CONFIRMED" },
      { status: "CONFIRMED", teacherPaidAt: paid, studentPaidAt: paid },
    );
    expect(item(l, "t").needsAction).toBe(true);
    expect(item(l, "s").needsAction).toBe(false);
  });
});

describe("groupLessons", () => {
  it("splits into action, upcoming and past, soonest first and latest past first", () => {
    const items = toItems(
      [
        lesson({ id: "action" }),
        lesson({
          id: "later",
          status: "CONFIRMED",
          startTime: "2026-01-08T10:00:00Z",
          endTime: "2026-01-08T11:00:00Z",
        }),
        lesson({ id: "soon", status: "CONFIRMED" }),
        lesson({ id: "cancelled", status: "CANCELLED" }),
        lesson({ id: "old", ...PAST, status: "COMPLETED" }),
      ],
      "t",
      now,
    );
    const ids = (list: typeof items) => list.map((i) => i.lesson.id);
    const groups = groupLessons(items);
    expect(ids(groups.action)).toEqual(["action"]);
    expect(ids(groups.upcoming)).toEqual(["soon", "later"]);
    expect(ids(groups.past)).toEqual(["cancelled", "old"]);
  });
});
