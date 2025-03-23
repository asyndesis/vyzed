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
        let baseWhere = {
          teacherProfile: {
            isNot: null,
          },
        };

        // Start with the base condition
        let whereConditions = [baseWhere];

        // Add teaching skill filters if provided
        if (filters?.teachingSkills?.length > 0) {
          // For each teaching skill filter, create a separate condition
          filters.teachingSkills.forEach(({ skillId, proficiency }) => {
            const proficiencyValue = parseInt(proficiency, 10);

            // Only add valid proficiency values
            if (!isNaN(proficiencyValue)) {
              whereConditions.push({
                teacherProfile: {
                  skills: {
                    some: {
                      skillId: skillId,
                      proficiency: {
                        gte: proficiencyValue, // Greater than or equal to the specified proficiency
                      },
                    },
                  },
                },
              });
            } else {
              // If no valid proficiency, just filter by skillId
              whereConditions.push({
                teacherProfile: {
                  skills: {
                    some: {
                      skillId: skillId,
                    },
                  },
                },
              });
            }
          });
        }

        // Add student skill filters if provided
        if (filters?.studentSkills?.length > 0) {
          // For each student skill filter, create a separate condition
          filters.studentSkills.forEach(({ skillId, proficiency }) => {
            const proficiencyValue = parseInt(proficiency, 10);

            // Only add valid proficiency values
            if (!isNaN(proficiencyValue)) {
              whereConditions.push({
                studentProfile: {
                  skills: {
                    some: {
                      skillId: skillId,
                      proficiency: {
                        gte: proficiencyValue,
                      },
                    },
                  },
                },
              });
            } else {
              // If no valid proficiency, just filter by skillId
              whereConditions.push({
                studentProfile: {
                  skills: {
                    some: {
                      skillId: skillId,
                    },
                  },
                },
              });
            }
          });
        }

        // Add search filter if provided
        if (filters?.search) {
          const searchTerm = filters.search.trim();

          if (searchTerm) {
            whereConditions.push({
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
              ],
            });
          }
        }

        // Combine all conditions with AND
        const finalWhere =
          whereConditions.length > 1
            ? { AND: whereConditions }
            : whereConditions[0];

        // Count total matching users for pagination
        const total = await prisma.user.count({
          where: finalWhere,
        });

        // Default pagination settings
        const take = pagination?.limit || 10;
        const skip = pagination?.offset || 0;

        // Fetch users with all relevant profile data
        const users = await prisma.user.findMany({
          where: finalWhere,
          take,
          skip,
          orderBy: {
            createdAt: "desc", // Most recent first
          },
          include: {
            // Include teacher profile with skills
            teacherProfile: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
            // Include user profile with languages
            userProfile: {
              include: {
                languages: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
            // Include student profile with skills
            studentProfile: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
        });

        // Return results with pagination info
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
