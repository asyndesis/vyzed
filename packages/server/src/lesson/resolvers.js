import { LessonStatus } from "@vyzed/prisma/enums";

const { CONFIRMED, COMPLETED, CANCELLED, REQUESTED } = LessonStatus;

// Note, permissions in this file are handled in the permissions.js file
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
    enrollments: async (parent, _, { prisma, user }) => {
      if (parent?.teacherId === user.id) {
        // Teacher can see all enrollments for their own lessons
        return prisma.enrollment.findMany({
          where: { lessonId: parent.id },
        });
      } else {
        // For students or any other user, only return their own enrollment
        return prisma.enrollment.findMany({
          where: {
            lessonId: parent.id,
            studentId: user.id,
          },
        });
      }
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

      // Return lessons but with a custom resolver for enrollments
      const lessons = await prisma.lesson.findMany({
        where,
        orderBy: { createdAt: "desc" },
        // Don't include enrollments here, will be handled by resolver
      });

      return lessons;
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
            teacherId: input.teacherId,
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
    changeLessonStatus: async (_, args, { user, prisma }) => {
      const { lessonId, status } = args;

      // Get the lesson with enrollments
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { enrollments: true },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Define valid transitions
      const validTransitions = {
        [REQUESTED]: [CONFIRMED, CANCELLED],
        [CONFIRMED]: [COMPLETED, CANCELLED],
        [COMPLETED]: [REQUESTED],
        [CANCELLED]: [REQUESTED],
      };

      // Check if transition is valid
      if (!validTransitions[lesson.status].includes(status)) {
        throw new Error(
          `Cannot change lesson from ${lesson.status} to ${status}`
        );
      }

      // Perform updates in a transaction
      await prisma.$transaction([
        prisma.enrollment.updateMany({
          where: {
            lessonId,
          },
          data: {
            status,
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
    // Student can change the status of their enrollment
    changeEnrollmentStatus: async (_, args, { user, prisma }) => {
      const { enrollmentId, status } = args;

      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      return prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status,
          updatedBy: user.id,
        },
      });
    },
    // Both student and teacher can confirm the payment
    updateEnrollmentPaymentStatus: async (
      _,
      { enrollmentId, isPaid },
      { user, prisma }
    ) => {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      const isTeacher = enrollment.teacherId === user.id;
      const isStudent = enrollment.studentId === user.id;
      const paidDate = isPaid ? new Date() : null;

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      return prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          ...(isTeacher && {
            teacherPaymentAt: paidDate,
          }),
          ...(isStudent && {
            studentPaymentAt: paidDate,
          }),
          updatedBy: user.id,
        },
      });
    },
    cancelEnrollment: async (_, { enrollmentId }, { user, prisma }) => {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // Check if the enrollment is already cancelled
      if (enrollment.status === LessonStatus.CANCELLED) {
        throw new Error("Enrollment is already cancelled");
      }

      // Update the enrollment to cancelled
      return prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: LessonStatus.CANCELLED,
          updatedBy: user.id,
        },
      });
    },
  },
};
