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
        // Base condition - user must have a teacherProfile
        const where = {
          teacherProfile: { isNot: null },
        };

        // Use a single where.AND array for all filters
        where.AND = [];

        // Add teaching skills filter if provided
        if (filters?.teachingSkills?.length > 0) {
          where.AND.push({
            teacherProfile: {
              is: {
                skills: {
                  some: {
                    OR: filters.teachingSkills.map(
                      ({ skillId, proficiency }) => ({
                        skillId,
                        proficiency: { gte: Number(proficiency) },
                      }),
                    ),
                  },
                },
              },
            },
          });
        }

        // Add student skills filter if provided
        if (filters?.studentSkills?.length > 0) {
          where.AND.push({
            studentProfile: {
              is: {
                skills: {
                  some: {
                    OR: filters.studentSkills.map(
                      ({ skillId, proficiency }) => ({
                        skillId,
                        proficiency: { gte: Number(proficiency) },
                      }),
                    ),
                  },
                },
              },
            },
          });
        }

        // Add language filter if provided
        if (filters?.languages?.length > 0) {
          where.AND.push({
            userProfile: {
              is: {
                languages: {
                  some: {
                    OR: filters.languages.map(({ skillId, proficiency }) => ({
                      skillId,
                      proficiency: { gte: Number(proficiency) },
                    })),
                  },
                },
              },
            },
          });
        }

        // Add allowBarter filter if provided
        if (filters?.allowBarter === true) {
          where.AND.push({
            teacherProfile: {
              is: {
                allowBarter: true,
              },
            },
          });
        }

        // Add search filter if provided
        if (filters?.search?.trim()) {
          const searchTerm = filters.search.trim();
          where.AND.push({
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
            ],
          });
        }

        // If no filters were applied, remove the empty AND array
        if (where.AND.length === 0) {
          delete where.AND;
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
