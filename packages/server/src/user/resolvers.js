export const userResolvers = {
  User: {
    studentProfile: async (parent, _, { prisma }) => {
      return prisma.studentProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    teacherProfile: async (parent, _, { prisma }) => {
      return prisma.teacherProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    userProfile: async (parent, _, { prisma }) => {
      return prisma.userProfile.findUnique({
        where: { userId: parent.id },
      });
    },
    userSchedule: async (parent, _, { prisma }) => {
      return prisma.userSchedule.findUnique({
        where: { userId: parent.id },
      });
    },
    lastInitial: async (parent) => {
      return parent.lastName ? parent.lastName.charAt(0) : "";
    },
  },
  PublicUser: {
    studentProfile: async (parent, _, { prisma }) => {
      return prisma.studentProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    teacherProfile: async (parent, _, { prisma }) => {
      return prisma.teacherProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    userProfile: async (parent, _, { prisma }) => {
      return prisma.userProfile.findUnique({
        where: { userId: parent.id },
      });
    },
    lastInitial: async (parent) => {
      return parent.lastName ? parent.lastName.charAt(0) : "";
    },
  },
  Query: {
    me: async (parent, args, context) => {
      return context?.user;
    },
    userById: async (parent, args, { prisma }) => {
      const { id } = args;
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    users: async (parent, args, { prisma }) => {
      try {
        return await prisma.user.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
    publicUserById: async (_, { id }, { prisma }) => {
      try {
        return await prisma.user.findUnique({
          where: { id },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    publicTeacherUsers: async (_, { filters, pagination }, { prisma }) => {
      try {
        // Mongo + Prisma can't reliably filter through nested relations,
        // so resolve each filter to a set of userIds and intersect them.
        const skillMatch = (list) => ({
          OR: list.map(({ skillId, proficiency }) => ({
            skillId,
            proficiency: { gte: Number(proficiency) },
          })),
        });
        const intersect = (a, b) => (a ? a.filter((id) => b.includes(id)) : b);

        // Teachers = profiles with at least one (matching) teaching skill
        const teacherProfiles = await prisma.teacherProfile.findMany({
          where: filters?.allowBarter === true ? { allowBarter: true } : {},
          select: { id: true, userId: true },
        });
        const teacherSkills = await prisma.teacherSkill.findMany({
          where: {
            teacherProfileId: { in: teacherProfiles.map((p) => p.id) },
            ...(filters?.teachingSkills?.length > 0 &&
              skillMatch(filters.teachingSkills)),
          },
          select: { teacherProfileId: true },
        });
        const teachingProfileIds = new Set(
          teacherSkills.map((s) => s.teacherProfileId),
        );
        let userIds = teacherProfiles
          .filter((p) => teachingProfileIds.has(p.id))
          .map((p) => p.userId);

        if (filters?.studentSkills?.length > 0) {
          const rows = await prisma.studentSkill.findMany({
            where: skillMatch(filters.studentSkills),
            select: { studentProfile: { select: { userId: true } } },
          });
          userIds = intersect(userIds, rows.map((r) => r.studentProfile.userId));
        }

        if (filters?.languages?.length > 0) {
          const rows = await prisma.userLanguage.findMany({
            where: skillMatch(filters.languages),
            select: { userProfile: { select: { userId: true } } },
          });
          userIds = intersect(userIds, rows.map((r) => r.userProfile.userId));
        }

        const where = { id: { in: [...new Set(userIds)] } };

        if (filters?.search?.trim()) {
          const searchTerm = filters.search.trim();
          where.OR = [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
          ];
        }

        // Set pagination parameters
        const take = pagination?.limit || 10;
        const skip = pagination?.offset || 0;

        // Run count and findMany in parallel for better performance
        const [total, users] = await Promise.all([
          prisma.user.count({ where }),
          prisma.user.findMany({
            where,
            take,
            skip,
            orderBy: { createdAt: "desc" },
          }),
        ]);

        return {
          users,
          pagination: {
            total,
            limit: take,
            offset: skip,
            hasMore: skip + take < total,
          },
        };
      } catch (err) {
        console.error("Error in publicTeacherUsers resolver:", err);
        throw new Error(`Failed to fetch teachers: ${err.message}`);
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, { user, prisma }) => {
      const { input } = args;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new Error("User already exists.");
        }

        const newUser = await prisma.user.create({
          data: {
            ...input,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });
        return newUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateUser: async (parent, args, { user, prisma }) => {
      const { id, input } = args;

      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user?.id,
          },
        });
        return updatedUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteUser: async (parent, args, { prisma }) => {
      const { id } = args;
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
