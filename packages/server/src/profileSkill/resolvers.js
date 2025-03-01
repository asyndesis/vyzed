import { prisma } from "@vyzed/prisma";

export const profileSkillResolvers = {
  ProfileSkill: {
    profile: async (parent) => {
      return prisma.profile.findUnique({ where: { id: parent.profileId } });
    },
    skill: async (parent) => {
      return prisma.skill.findUnique({ where: { id: parent.skillId } });
    },
  },
  Query: {
    profileSkillById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.profileSkill.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    profileSkillsByProfileId: async (parent, args) => {
      const { profileId } = args;
      try {
        return await prisma.profileSkill.findMany({ where: { profileId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    profileSkillsBySkillId: async (parent, args) => {
      const { skillId } = args;
      try {
        return await prisma.profileSkill.findMany({ where: { skillId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    profileSkills: async () => {
      try {
        return await prisma.profileSkill.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createProfileSkill: async (parent, args) => {
      const { input } = args;
      try {
        return await prisma.profileSkill.create({ data: input });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateProfileSkill: async (parent, args) => {
      const { id, input } = args;
      try {
        return await prisma.profileSkill.update({
          where: { id },
          data: input,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteProfileSkill: async (parent, args) => {
      const { id } = args;
      try {
        await prisma.profileSkill.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
