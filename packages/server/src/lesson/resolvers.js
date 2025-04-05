import { LessonStatus } from "@vyzed/prisma/enums";

export const lessonResolvers = {
  Lesson: {
    teacher: async (parent, _, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: parent.teacherId },
      });
    },
    skill: async (parent, _, { prisma }) => {
      return prisma.skill.findUnique({
        where: { id: parent.skillId },
      });
    },
    enrollments: async (parent, _, { prisma }) => {
      return prisma.enrollment.findMany({
        where: { lessonId: parent.id },
      });
    },
  },
  Enrollment: {
    lesson: async (parent, _, { prisma }) => {
      return prisma.lesson.findUnique({
        where: { id: parent.lessonId },
      });
    },
    student: async (parent, _, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: parent.studentId },
      });
    },
  },
  Query: {
    myLessonsAsStudent: async (_, __, { user, prisma }) => {
      return prisma.lesson.findMany({
        where: {
          enrollments: {
            some: {
              studentId: user.id,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    myLessonsAsTeacher: async (_, __, { user, prisma }) => {
      return prisma.lesson.findMany({
        where: {
          teacherId: user.id,
        },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Mutation: {
    // Student requests a lesson
    requestLesson: async (_, { input }, { user, prisma }) => {
      return await prisma.$transaction(async (tx) => {
        const endDateTime = new Date(input.startTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 60);

        // First create the lesson
        const lesson = await tx.lesson.create({
          data: {
            startTime: input.startTime,
            endTime: endDateTime,
            teacherId: input.teacherId,
            skillId: input.skillId,
            proficiency: input.proficiency,
            status: LessonStatus.REQUESTED,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        // Then create the enrollment for the requesting student
        await tx.enrollment.create({
          data: {
            lessonId: lesson.id,
            studentId: user.id,
            paymentType: input.paymentType,
            paymentAmount: input.paymentAmount,
            paymentCurrency: input.paymentCurrency,
            status: LessonStatus.REQUESTED,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return lesson;
      });
    },
    approveLesson: async (_, { lessonId }, { user, prisma }) => {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Update the lesson status to CONFIRMED
      await prisma.lesson.update({
        where: {
          id: lesson.id,
          status: LessonStatus.REQUESTED,
        },
        data: {
          status: LessonStatus.CONFIRMED,
          updatedBy: user.id,
        },
      });

      // Update the enrollment status to CONFIRMED
      await prisma.enrollment.updateMany({
        where: {
          lessonId: lesson.id,
          status: LessonStatus.REQUESTED,
        },
        data: {
          status: LessonStatus.CONFIRMED,
          updatedBy: user.id,
        },
      });

      return lesson;
    },
    rejectLesson: async (_, { lessonId }, { user, prisma }) => {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { enrollments: true },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Update the enrollment status to REJECTED
      await prisma.enrollment.updateMany({
        where: {
          lessonId: lesson.id,
          status: LessonStatus.REQUESTED,
        },
        data: {
          status: LessonStatus.REJECTED,
          updatedBy: user.id,
        },
      });

      // Update the lesson status to CANCELLED
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          status: LessonStatus.CANCELLED,
          updatedBy: user.id,
        },
      });

      return prisma.lesson.findUnique({
        where: { id: lesson.id },
      });
    },
  },
};
