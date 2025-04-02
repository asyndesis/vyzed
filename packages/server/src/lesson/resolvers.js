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
    requestLesson: async (_, { input }, { user, prisma }) => {
      // Use a transaction to create both the lesson and enrollment
      return prisma.$transaction(async (tx) => {
        // First create the lesson
        const lesson = await tx.lesson.create({
          data: {
            title: input.title,
            description: input.description,
            startTime: input.startTime,
            endTime: input.endTime,
            teacherId: input.teacherId,
            skillId: input.skillId,
            proficiency: input.proficiency,
            status: "SCHEDULED",
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
            barterLessonId: input.barterLessonId,
            status: "REQUESTED",
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return lesson;
      });
    },
    approveLesson: async (_, { lessonId }, { user, prisma }) => {
      // Get the lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Update the enrollment status to CONFIRMED
      await prisma.enrollment.updateMany({
        where: {
          lessonId: lesson.id,
          status: "REQUESTED",
        },
        data: {
          status: "CONFIRMED",
          updatedBy: user.id,
        },
      });

      return lesson;
    },
    rejectLesson: async (_, { lessonId }, { user, prisma }) => {
      // Get the lesson
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
          status: "REQUESTED",
        },
        data: {
          status: "REJECTED",
          updatedBy: user.id,
        },
      });

      // Update the lesson status to CANCELLED
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          status: "CANCELLED",
          updatedBy: user.id,
        },
      });

      return prisma.lesson.findUnique({
        where: { id: lesson.id },
      });
    },
  },
};
