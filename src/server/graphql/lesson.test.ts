import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { enrollment, lesson, skill, user, userSkill } from "@/server/db/schema";
import { asUser, gql } from "@/server/test/graphql";

async function setup() {
  const [guitar] = await db
    .insert(skill)
    .values({ slug: "guitar", name: "Guitar" })
    .returning();
  await db.insert(user).values([
    { id: "teacher", name: "T", email: "t@example.com", priceAmount: 2500 },
    { id: "student", name: "S", email: "s@example.com" },
    { id: "stranger", name: "X", email: "x@example.com" },
  ]);
  await db.insert(userSkill).values({
    userId: "teacher",
    skillId: guitar.id,
    kind: "teaches",
    proficiency: 5,
  });
  const start = new Date(Date.now() + 86_400_000);
  const [l] = await db
    .insert(lesson)
    .values({
      teacherId: "teacher",
      skillId: guitar.id,
      proficiency: 3,
      startTime: start,
      endTime: new Date(start.getTime() + 3_600_000),
    })
    .returning();
  const [e] = await db
    .insert(enrollment)
    .values({ lessonId: l.id, studentId: "student" })
    .returning();
  return { guitarId: guitar.id, lessonId: l.id, enrollmentId: e.id };
}

const setStatus = `mutation($id: ID!, $status: LessonStatus!) {
  setLessonStatus(lessonId: $id, status: $status) { status enrollments { status } }
}`;

describe("requestLesson", () => {
  const request = `mutation($input: RequestLessonInput!) {
    requestLesson(input: $input) { status enrollments { paymentType paymentAmount } }
  }`;

  it("charges the teacher's price, not one the client sends", async () => {
    const { guitarId } = await setup();
    const { data, message } = await gql(request, {
      viewer: asUser("student"),
      variables: {
        input: {
          teacherId: "teacher",
          skillId: guitarId,
          proficiency: 2,
          startTime: new Date(Date.now() + 86_400_000).toISOString(),
          paymentType: "CASH",
        },
      },
    });
    expect(message).toBeUndefined();
    expect(data?.requestLesson).toEqual({
      status: "REQUESTED",
      enrollments: [{ paymentType: "CASH", paymentAmount: 2500 }],
    });
  });

  it("refuses a free lesson from a paid teacher", async () => {
    const { guitarId } = await setup();
    const { message } = await gql(request, {
      viewer: asUser("student"),
      variables: {
        input: {
          teacherId: "teacher",
          skillId: guitarId,
          proficiency: 2,
          startTime: new Date(Date.now() + 86_400_000).toISOString(),
          paymentType: "FREE",
        },
      },
    });
    expect(message).toMatch(/payment option is not available/);
  });
});

describe("setLessonStatus", () => {
  it("lets the teacher confirm, moving the enrollment with it", async () => {
    const { lessonId } = await setup();
    const { data } = await gql(setStatus, {
      viewer: asUser("teacher"),
      variables: { id: lessonId, status: "CONFIRMED" },
    });
    expect(data?.setLessonStatus).toEqual({
      status: "CONFIRMED",
      enrollments: [{ status: "CONFIRMED" }],
    });
  });

  it("forbids anyone but the teacher", async () => {
    const { lessonId } = await setup();
    for (const id of ["student", "stranger"]) {
      const { code } = await gql(setStatus, {
        viewer: asUser(id),
        variables: { id: lessonId, status: "CONFIRMED" },
      });
      expect(code).toBe("FORBIDDEN");
    }
  });

  it("won't complete a lesson until both sides confirm payment", async () => {
    const { lessonId } = await setup();
    const teacher = { viewer: asUser("teacher") };
    await gql(setStatus, {
      ...teacher,
      variables: { id: lessonId, status: "CONFIRMED" },
    });
    const { message } = await gql(setStatus, {
      ...teacher,
      variables: { id: lessonId, status: "COMPLETED" },
    });
    expect(message).toMatch(/Both sides must confirm payment/);
  });
});

describe("privacy", () => {
  it("hides a user's email from other people", async () => {
    await setup();
    const query = `{ user(id: "teacher") { email } }`;
    expect(
      (await gql(query, { viewer: asUser("student") })).data?.user.email,
    ).toBeNull();
    expect(
      (await gql(query, { viewer: asUser("teacher") })).data?.user.email,
    ).toBe("t@example.com");
  });
});
