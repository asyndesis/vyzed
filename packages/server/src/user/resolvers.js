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
          teacherProfile: {
            isNot: null,
          },
        };

        // Add teaching skills filter if provided
        if (filters?.teachingSkills?.length > 0) {
          // Use 'some' to find teachers with any of the specified skills
          where.AND = filters.teachingSkills.map(
            ({ skillId, proficiency }) => ({
              teacherProfile: {
                is: {
                  skills: {
                    some: {
                      skillId,
                      proficiency: { gte: Number(proficiency) },
                    },
                  },
                },
              },
            })
          );
        }

        // Add student skills filter if provided
        if (filters?.studentSkills?.length > 0) {
          // If we already have teaching skills filters, append to AND array
          const studentSkillsConditions = filters.studentSkills.map(
            ({ skillId, proficiency }) => ({
              studentProfile: {
                is: {
                  skills: {
                    some: {
                      skillId,
                      proficiency: { gte: Number(proficiency) },
                    },
                  },
                },
              },
            })
          );

          if (where.AND) {
            where.AND = [...where.AND, ...studentSkillsConditions];
          } else {
            where.AND = studentSkillsConditions;
          }
        }

        // Add language filter if provided
        if (filters?.languages?.length > 0) {
          // Create conditions for language filtering
          const languageConditions = filters.languages.map(
            ({ skillId, proficiency }) => ({
              userProfile: {
                is: {
                  languages: {
                    some: {
                      skillId,
                      proficiency: { gte: Number(proficiency) },
                    },
                  },
                },
              },
            })
          );

          if (where.AND) {
            where.AND = [...where.AND, ...languageConditions];
          } else {
            where.AND = languageConditions;
          }
        }

        // Add search filter if provided
        if (filters?.search?.trim()) {
          const searchCondition = {
            OR: [
              {
                firstName: {
                  contains: filters.search.trim(),
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: filters.search.trim(),
                  mode: "insensitive",
                },
              },
            ],
          };

          if (where.AND) {
            where.AND.push(searchCondition);
          } else {
            where.AND = [searchCondition];
          }
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
              include: {
                skills: { include: { skill: true } },
              },
            },
            userProfile: {
              include: {
                languages: { include: { skill: true } },
              },
            },
            studentProfile: {
              include: {
                skills: { include: { skill: true } },
              },
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
