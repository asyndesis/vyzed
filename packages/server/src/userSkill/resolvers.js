import { prisma } from "@vyzed/prisma";

export const userSkillResolvers = {
  UserSkill: {
    user: async (parent) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    skill: async (parent) => {
      return prisma.skill.findUnique({ where: { id: parent.skillId } });
    },
  },
  Query: {
    userSkillById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.userSkill.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    userSkillsByUserId: async (parent, args) => {
      const { userId } = args;
      try {
        return await prisma.userSkill.findMany({ where: { userId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    userSkillsBySkillId: async (parent, args) => {
      const { skillId } = args;
      try {
        return await prisma.userSkill.findMany({ where: { skillId } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    userSkills: async () => {
      try {
        return await prisma.userSkill.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createUserSkill: async (parent, args, { user }) => {
      const { input } = args;
      try {
        return await prisma.userSkill.create({
          data: {
            ...input,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateUserSkill: async (parent, args, { user }) => {
      const { id, input } = args;
      try {
        return await prisma.userSkill.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id,
          },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    deleteUserSkill: async (parent, args) => {
      const { id } = args;
      try {
        await prisma.userSkill.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
