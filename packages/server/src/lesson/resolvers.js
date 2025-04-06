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
    myLessonsAsStudent: async (_, { filter }, { user, prisma }) => {
      // Build where clause with filters
      const where = {
        enrollments: {
          some: {
            studentId: user.id,
          },
        },
      };

      // Apply status filter if provided
      if (filter?.status) {
        where.status = filter.status;
      }

      // Apply date range filters if provided
      if (filter?.startDateFrom || filter?.startDateTo) {
        where.startTime = {};

        if (filter?.startDateFrom) {
          where.startTime.gte = new Date(filter.startDateFrom);
        }

        if (filter?.startDateTo) {
          where.startTime.lte = new Date(filter.startDateTo);
        }
      }

      return prisma.lesson.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    },
    myLessonsAsTeacher: async (_, { filter }, { user, prisma }) => {
      // Build where clause with filters
      const where = {
        teacherId: user.id,
      };

      // Apply status filter if provided
      if (filter?.status) {
        where.status = filter.status;
      }

      // Apply date range filters if provided
      if (filter?.startDateFrom || filter?.startDateTo) {
        where.startTime = {};

        if (filter?.startDateFrom) {
          where.startTime.gte = new Date(filter.startDateFrom);
        }

        if (filter?.startDateTo) {
          where.startTime.lte = new Date(filter.startDateTo);
        }
      }

      return prisma.lesson.findMany({
        where,
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
    // New consolidated changeLessonStatus mutation
    changeLessonStatus: async (_, { input }, { user, prisma }) => {
      const { lessonId, status } = input;

      // Get the lesson with enrollments
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { enrollments: true },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Check permissions - only teacher can change status
      if (lesson.teacherId !== user.id) {
        throw new Error(
          "You don't have permission to change this lesson's status"
        );
      }

      // Define valid transitions
      const validTransitions = {
        [LessonStatus.REQUESTED]: [
          LessonStatus.CONFIRMED,
          LessonStatus.CANCELLED,
        ],
        [LessonStatus.CONFIRMED]: [
          LessonStatus.COMPLETED,
          LessonStatus.CANCELLED,
        ],
        [LessonStatus.COMPLETED]: [],
        [LessonStatus.CANCELLED]: [],
        [LessonStatus.REJECTED]: [],
      };

      // Check if transition is valid
      if (!validTransitions[lesson.status].includes(status)) {
        throw new Error(
          `Cannot change lesson from ${lesson.status} to ${status}`
        );
      }

      // Determine the appropriate enrollment status
      let enrollmentStatus = status;
      if (
        status === LessonStatus.CANCELLED &&
        lesson.status === LessonStatus.REQUESTED
      ) {
        enrollmentStatus = LessonStatus.REJECTED;
      }

      // Perform updates in a transaction
      await prisma.$transaction([
        // Update enrollments
        prisma.enrollment.updateMany({
          where: {
            lessonId,
            status: lesson.status,
          },
          data: {
            status: enrollmentStatus,
            updatedBy: user.id,
          },
        }),

        // Update lesson
        prisma.lesson.update({
          where: { id: lessonId },
          data: {
            status,
            updatedBy: user.id,
          },
        }),
      ]);

      // Return the updated lesson
      return prisma.lesson.findUnique({
        where: { id: lessonId },
      });
    },
  },
};
