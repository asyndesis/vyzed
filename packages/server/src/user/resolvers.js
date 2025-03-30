import { prisma } from "@vyzed/prisma";

export const userResolvers = {
  User: {
    studentProfile: async (parent) => {
      return prisma.studentProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    teacherProfile: async (parent) => {
      return prisma.teacherProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    userProfile: async (parent) => {
      return prisma.userProfile.findUnique({
        where: { userId: parent.id },
      });
    },
    lastInitial: async (parent) => {
      return parent.lastName ? parent.lastName.charAt(0) : "";
    },
  },
  PublicUser: {
    studentProfile: async (parent) => {
      return prisma.studentProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    teacherProfile: async (parent) => {
      return prisma.teacherProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    userProfile: async (parent) => {
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
    userById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.user.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    userByAuthId: async (parent, args) => {
      const { authId } = args;
      try {
        return await prisma.user.findUnique({ where: { authId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    checkUserExistsByAuthId: async (parent, args) => {
      const { authId } = args;
      try {
        const user = await prisma.user.findUnique({ where: { authId } });
        return !!user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    users: async () => {
      try {
        return await prisma.user.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
    publicUserById: async (_, { id }) => {
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

        const addFilterCondition = (condition) => {
          where.AND = where.AND ? [...where.AND, condition] : [condition];
        };

        // Add teaching skills filter if provided
        if (filters?.teachingSkills?.length > 0) {
          const teachingSkillsCondition = {
            teacherProfile: {
              is: {
                skills: {
                  some: {
                    OR: filters.teachingSkills.map(
                      ({ skillId, proficiency }) => ({
                        skillId,
                        proficiency: { gte: Number(proficiency) },
                      })
                    ),
                  },
                },
              },
            },
          };
          addFilterCondition(teachingSkillsCondition);
        }

        // Add student skills filter if provided
        if (filters?.studentSkills?.length > 0) {
          const studentSkillsCondition = {
            studentProfile: {
              is: {
                skills: {
                  some: {
                    OR: filters.studentSkills.map(
                      ({ skillId, proficiency }) => ({
                        skillId,
                        proficiency: { gte: Number(proficiency) },
                      })
                    ),
                  },
                },
              },
            },
          };
          addFilterCondition(studentSkillsCondition);
        }

        // Add language filter if provided
        if (filters?.languages?.length > 0) {
          const languageCondition = {
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
          };
          addFilterCondition(languageCondition);
        }

        // Add allowBarter filter if provided
        if (filters?.allowBarter !== undefined) {
          const allowBarterCondition = {
            teacherProfile: {
              is: {
                allowBarter: filters.allowBarter,
              },
            },
          };
          addFilterCondition(allowBarterCondition);
        }

        // Add search filter if provided
        if (filters?.search?.trim()) {
          const searchTerm = filters.search.trim();
          const searchCondition = {
            OR: [
              { firstName: { contains: searchTerm, mode: "insensitive" } },
              { lastName: { contains: searchTerm, mode: "insensitive" } },
            ],
          };
          addFilterCondition(searchCondition);
        }

        // Set pagination parameters
        const take = pagination?.limit || 10;
        const skip = pagination?.offset || 0;

        // Get total count for pagination
        const total = await prisma.user.count({ where });

        // Fetch users with profiles
        const users = await prisma.user.findMany({
          where,
          take,
          skip,
          orderBy: { createdAt: "desc" },
          include: {
            teacherProfile: {
              include: { skills: { include: { skill: true } } },
            },
            userProfile: {
              include: { languages: { include: { skill: true } } },
            },
            studentProfile: {
              include: { skills: { include: { skill: true } } },
            },
          },
        });

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
    createUser: async (parent, args, { user }) => {
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
    createMyUser: async (parent, args, { auth }) => {
      const { input } = args;
      const { userId: authId } = auth;
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
            createdBy: authId,
            updatedBy: authId,
            roles: ["user"],
          },
        });
        return newUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateUser: async (parent, args, { user }) => {
      const { id, input } = args;
      const { authId } = user || {};
      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            ...input,
            updatedBy: authId,
          },
        });
        return updatedUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteUser: async (parent, args) => {
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
