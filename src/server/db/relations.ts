import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    skills: r.many.userSkill({ from: r.user.id, to: r.userSkill.userId }),
    taughtLessons: r.many.lesson({ from: r.user.id, to: r.lesson.teacherId }),
    enrollments: r.many.enrollment({
      from: r.user.id,
      to: r.enrollment.studentId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  skill: {
    parent: r.one.skill({
      from: r.skill.parentId,
      to: r.skill.id,
      alias: "hierarchy",
    }),
    children: r.many.skill({
      from: r.skill.id,
      to: r.skill.parentId,
      alias: "hierarchy",
    }),
  },
  userSkill: {
    user: r.one.user({
      from: r.userSkill.userId,
      to: r.user.id,
      optional: false,
    }),
    skill: r.one.skill({
      from: r.userSkill.skillId,
      to: r.skill.id,
      optional: false,
    }),
  },
  lesson: {
    teacher: r.one.user({
      from: r.lesson.teacherId,
      to: r.user.id,
      optional: false,
    }),
    skill: r.one.skill({
      from: r.lesson.skillId,
      to: r.skill.id,
      optional: false,
    }),
    enrollments: r.many.enrollment({
      from: r.lesson.id,
      to: r.enrollment.lessonId,
      alias: "lesson",
    }),
  },
  enrollment: {
    lesson: r.one.lesson({
      from: r.enrollment.lessonId,
      to: r.lesson.id,
      optional: false,
      alias: "lesson",
    }),
    student: r.one.user({
      from: r.enrollment.studentId,
      to: r.user.id,
      optional: false,
    }),
    barterLesson: r.one.lesson({
      from: r.enrollment.barterLessonId,
      to: r.lesson.id,
      alias: "barter",
    }),
  },
}));
