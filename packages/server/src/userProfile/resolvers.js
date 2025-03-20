import { prisma } from "@vyzed/prisma";

export const userProfileResolvers = {
  UserProfile: {},
  Query: {
    userProfileById: async (parent, args) => {
      const { id } = args;
      return prisma.userProfile.findUnique({ where: { id } });
    },
    userProfileByUserId: async (parent, args) => {
      const { userId } = args;
      return prisma.userProfile.findUnique({ where: { userId } });
    },
    userProfiles: async () => {
      return prisma.userProfile.findMany();
    },
  },
  Mutation: {
    createUserProfile: async (_, { input }, { user }) => {
      const { userId, bio } = input;

      return prisma.userProfile.create({
        data: {
          userId,
          bio,
          createdBy: user?.id,
          updatedBy: user?.id,
        },
        include: {
          user: true,
        },
      });
    },
    updateUserProfile: async (_, { id, input }, { user }) => {
      const { bio } = input;

      return prisma.userProfile.update({
        where: { id },
        data: {
          bio,
          updatedBy: user?.id,
        },
        include: {
          user: true,
        },
      });
    },
    deleteUserProfile: async (parent, args) => {
      const { id } = args;
      await prisma.userProfile.delete({ where: { id } });
      return true;
    },
  },
};
