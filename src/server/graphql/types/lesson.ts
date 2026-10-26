import { eq } from "drizzle-orm";
import { LESSON_MINUTES, canTransition, isSettled } from "@/domain/lessons";
import { can } from "@/domain/policies";
import { db } from "../../db";
import { enrollment, lesson } from "../../db/schema";
import { builder, forbid, notFound, viewerOf } from "../builder";
import { LessonStatusEnum, PaymentTypeEnum } from "./enums";

const NONE = "00000000-0000-0000-0000-000000000000";

export const Lesson = builder.drizzleObject("lesson", {
  name: "Lesson",
  fields: (t) => ({
    id: t.exposeID("id"),
    startTime: t.expose("startTime", { type: "DateTime" }),
    endTime: t.expose("endTime", { type: "DateTime" }),
    status: t.expose("status", { type: LessonStatusEnum }),
    proficiency: t.exposeInt("proficiency"),
    teacherId: t.exposeID("teacherId"),
    teacher: t.relation("teacher"),
    skill: t.relation("skill"),
    // Teachers see every enrollment; students see only their own
    enrollments: t.relation("enrollments", {
      query: (_, ctx) => ({
        where: ctx.viewer
          ? {
              OR: [
                { studentId: ctx.viewer.id },
                { lesson: { teacherId: ctx.viewer.id } },
              ],
            }
          : { id: NONE },
      }),
    }),
  }),
});

export const Enrollment = builder.drizzleObject("enrollment", {
  name: "Enrollment",
  fields: (t) => ({
    id: t.exposeID("id"),
    status: t.expose("status", { type: LessonStatusEnum }),
    paymentType: t.expose("paymentType", { type: PaymentTypeEnum }),
    paymentAmount: t.exposeInt("paymentAmount", { nullable: true }),
    paymentCurrency: t.exposeString("paymentCurrency", { nullable: true }),
    teacherPaidAt: t.expose("teacherPaidAt", {
      type: "DateTime",
      nullable: true,
    }),
    studentPaidAt: t.expose("studentPaidAt", {
      type: "DateTime",
      nullable: true,
    }),
    student: t.relation("student"),
    lesson: t.relation("lesson"),
  }),
});

builder.queryFields((t) => ({
  // Lessons I teach or am enrolled in, soonest first
  myLessons: t.drizzleField({
    type: ["lesson"],
    authScopes: { loggedIn: true },
    resolve: (query, _, __, ctx) => {
      const { id } = viewerOf(ctx);
      return db.query.lesson.findMany(
        query({
          where: {
            OR: [{ teacherId: id }, { enrollments: { studentId: id } }],
          },
          orderBy: { startTime: "asc" },
        }),
      );
    },
  }),
}));

const RequestLessonInput = builder.inputType("RequestLessonInput", {
  fields: (t) => ({
    teacherId: t.id({ required: true }),
    skillId: t.id({ required: true }),
    proficiency: t.int({ required: true }),
    startTime: t.field({ type: "DateTime", required: true }),
    paymentType: t.field({ type: PaymentTypeEnum, required: true }),
  }),
});

const loadEnrollment = async (id: string) =>
  (await db.query.enrollment.findFirst({
    where: { id },
    with: { lesson: true },
  })) ?? notFound("Enrollment");

builder.mutationFields((t) => ({
  // Student asks a teacher for a one-hour lesson
  requestLesson: t.drizzleField({
    type: "lesson",
    authScopes: { loggedIn: true },
    args: { input: t.arg({ type: RequestLessonInput, required: true }) },
    resolve: async (query, _, { input }, ctx) => {
      const viewer = viewerOf(ctx);
      const teacherId = String(input.teacherId);
      const skillId = String(input.skillId);
      if (teacherId === viewer.id) throw new Error("You can't book yourself");
      if (input.startTime < new Date())
        throw new Error("Pick a time in the future");

      const teacher = await db.query.user.findFirst({
        where: { id: teacherId },
        with: { skills: { where: { kind: "teaches", skillId } } },
      });
      if (!teacher?.skills.length)
        throw new Error("This teacher doesn't teach that skill");

      // The server decides the price; the client only picks how to pay
      const payment =
        input.paymentType === "BARTER"
          ? teacher.allowBarter
            ? { paymentType: "BARTER" as const }
            : null
          : teacher.priceAmount > 0
            ? input.paymentType === "CASH"
              ? {
                  paymentType: "CASH" as const,
                  paymentAmount: teacher.priceAmount,
                  paymentCurrency: teacher.priceCurrency,
                }
              : null
            : input.paymentType === "FREE"
              ? { paymentType: "FREE" as const }
              : null;
      if (!payment)
        throw new Error(
          "That payment option is not available for this teacher",
        );

      const id = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(lesson)
          .values({
            teacherId,
            skillId,
            proficiency: input.proficiency,
            startTime: input.startTime,
            endTime: new Date(
              input.startTime.getTime() + LESSON_MINUTES * 60_000,
            ),
          })
          .returning({ id: lesson.id });
        await tx
          .insert(enrollment)
          .values({ lessonId: row.id, studentId: viewer.id, ...payment });
        return row.id;
      });
      return db.query.lesson
        .findFirst(query({ where: { id } }))
        .then((l) => l!);
    },
  }),

  // Teacher confirms, cancels, revises, or completes a lesson (and all its enrollments)
  setLessonStatus: t.drizzleField({
    type: "lesson",
    authScopes: { loggedIn: true },
    args: {
      lessonId: t.arg.id({ required: true }),
      status: t.arg({ type: LessonStatusEnum, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const viewer = viewerOf(ctx);
      const lessonId = String(args.lessonId);
      const row =
        (await db.query.lesson.findFirst({
          where: { id: lessonId },
          with: { enrollments: true },
        })) ?? notFound("Lesson");
      if (!can(viewer, "lesson", "update", row)) forbid();
      if (!canTransition("teacher", row.status, args.status))
        throw new Error(
          `Cannot change a lesson from ${row.status} to ${args.status}`,
        );
      if (args.status === "COMPLETED" && !row.enrollments.every(isSettled))
        throw new Error("Both sides must confirm payment before completing");

      await db.transaction(async (tx) => {
        await tx
          .update(lesson)
          .set({ status: args.status })
          .where(eq(lesson.id, lessonId));
        await tx
          .update(enrollment)
          .set({ status: args.status })
          .where(eq(enrollment.lessonId, lessonId));
      });
      return db.query.lesson
        .findFirst(query({ where: { id: lessonId } }))
        .then((l) => l!);
    },
  }),

  // Student withdraws, re-requests, or answers a revision
  setEnrollmentStatus: t.drizzleField({
    type: "enrollment",
    authScopes: { loggedIn: true },
    args: {
      enrollmentId: t.arg.id({ required: true }),
      status: t.arg({ type: LessonStatusEnum, required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const viewer = viewerOf(ctx);
      const row = await loadEnrollment(String(args.enrollmentId));
      if (!can(viewer, "enrollment", "update", row)) forbid();
      if (!canTransition("student", row.status, args.status))
        throw new Error(
          `Cannot change an enrollment from ${row.status} to ${args.status}`,
        );

      await db.transaction(async (tx) => {
        await tx
          .update(enrollment)
          .set({ status: args.status })
          .where(eq(enrollment.id, row.id));
        // A one-student lesson follows its only enrollment
        const count = await tx.$count(
          enrollment,
          eq(enrollment.lessonId, row.lessonId),
        );
        if (count === 1)
          await tx
            .update(lesson)
            .set({ status: args.status })
            .where(eq(lesson.id, row.lessonId));
      });
      return db.query.enrollment
        .findFirst(query({ where: { id: row.id } }))
        .then((e) => e!);
    },
  }),

  // Either side confirms (or un-confirms) payment / a settled swap
  setPaid: t.drizzleField({
    type: "enrollment",
    authScopes: { loggedIn: true },
    args: {
      enrollmentId: t.arg.id({ required: true }),
      paid: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _, args, ctx) => {
      const viewer = viewerOf(ctx);
      const row = await loadEnrollment(String(args.enrollmentId));
      if (!can(viewer, "enrollment", "markPaid", row)) forbid();
      const at = args.paid ? new Date() : null;
      const isTeacher = row.lesson.teacherId === viewer.id;
      await db
        .update(enrollment)
        .set(isTeacher ? { teacherPaidAt: at } : { studentPaidAt: at })
        .where(eq(enrollment.id, row.id));
      return db.query.enrollment
        .findFirst(query({ where: { id: row.id } }))
        .then((e) => e!);
    },
  }),
}));
