import { prisma } from "@vyzed/prisma";

export const profileResolvers = {
  Profile: {
    user: async (parent) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    profileSkills: async (parent) => {
      return prisma.profileSkill.findMany({
        where: { profileId: parent.id },
      });
    },
  },
  Query: {
    profileById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.profile.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    profilesByUserId: async (parent, args) => {
      const { userId } = args;
      try {
        return await prisma.profile.findMany({ where: { userId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    profiles: async () => {
      try {
        return await prisma.profile.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createProfile: async (parent, args) => {
      const { input } = args;
      try {
        return await prisma.profile.create({ data: input });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateProfile: async (parent, args) => {
      const { id, input } = args;
      try {
        return await prisma.profile.update({
          where: { id },
          data: input,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteProfile: async (parent, args) => {
      const { id } = args;
      try {
        await prisma.profile.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
