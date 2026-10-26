import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/server/db/auth-schema";

export * from "@/server/db/auth-schema";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// Enums -----------------------------------------------------------------------

export const skillFramework = pgEnum("skill_framework", ["CEFR", "DEFAULT"]);
export const userSkillKind = pgEnum("user_skill_kind", [
  "speaks",
  "learns",
  "teaches",
]);
export const lessonStatus = pgEnum("lesson_status", [
  "REQUESTED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REVISED",
]);
export const paymentType = pgEnum("payment_type", [
  "CASH",
  "BARTER",
  "FREE",
  "CREDIT",
]);

// Skills ----------------------------------------------------------------------

export const skill = pgTable(
  "skill",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    parentId: uuid("parent_id").references((): any => skill.id),
    framework: skillFramework("framework").default("DEFAULT").notNull(),
    ...timestamps,
  },
  (t) => [index("skill_parent_idx").on(t.parentId)],
);

// What a user speaks, wants to learn, or teaches, with a 1-7 level
export const userSkill = pgTable(
  "user_skill",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id),
    kind: userSkillKind("kind").notNull(),
    proficiency: integer("proficiency").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.kind, t.skillId] }),
    index("user_skill_lookup_idx").on(t.kind, t.skillId, t.proficiency),
  ],
);

// Lessons ---------------------------------------------------------------------

export const lesson = pgTable(
  "lesson",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skill.id),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    proficiency: integer("proficiency").notNull(),
    maxStudents: integer("max_students").default(1).notNull(),
    status: lessonStatus("status").default("REQUESTED").notNull(),
    ...timestamps,
  },
  (t) => [index("lesson_teacher_idx").on(t.teacherId, t.startTime)],
);

export const enrollment = pgTable(
  "enrollment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: lessonStatus("status").default("REQUESTED").notNull(),
    paymentType: paymentType("payment_type").default("CASH").notNull(),
    paymentAmount: integer("payment_amount"),
    paymentCurrency: text("payment_currency"),
    // A lesson the student teaches in exchange
    barterLessonId: uuid("barter_lesson_id").references(() => lesson.id, {
      onDelete: "set null",
    }),
    teacherPaidAt: timestamp("teacher_paid_at"),
    studentPaidAt: timestamp("student_paid_at"),
    attended: boolean("attended").default(false).notNull(),
    ...timestamps,
  },
  (t) => [
    unique().on(t.lessonId, t.studentId),
    index("enrollment_student_idx").on(t.studentId),
  ],
);

// Marketing -------------------------------------------------------------------

export const mailingList = pgTable("mailing_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  ...timestamps,
});
