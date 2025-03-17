import { prisma } from "@vyzed/prisma";

export const skillResolvers = {
  Skill: {
    parent: async (parent) => {
      if (!parent.parentId) return null;
      return prisma.skill.findUnique({ where: { id: parent.parentId } });
    },
    children: async (parent) => {
      return prisma.skill.findMany({ where: { parentId: parent.id } });
    },
    teacherSkills: async (parent) => {
      return prisma.teacherSkill.findMany({ where: { skillId: parent.id } });
    },
    studentSkills: async (parent) => {
      return prisma.studentSkill.findMany({ where: { skillId: parent.id } });
    },
  },
  Query: {
    skillById: async (parent, args) => {
      const { id } = args;
      try {
        return await prisma.skill.findUnique({ where: { id } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    skillsByParentId: async (parent, args) => {
      const { parentId } = args;
      try {
        return await prisma.skill.findMany({
          where: parentId ? { parentId } : { parentId: null },
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    rootSkills: async () => {
      try {
        return await prisma.skill.findMany({ where: { parentId: null } });
      } catch (err) {
        throw new Error(err.message);
      }
    },
    allSkills: async () => {
      try {
        return await prisma.skill.findMany();
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createSkill: async (parent, args, { user }) => {
      const { input } = args;
      try {
        return await prisma.skill.create({
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
    updateSkill: async (parent, args, { user }) => {
      const { id, input } = args;
      try {
        return await prisma.skill.update({
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
    deleteSkill: async (parent, args) => {
      const { id } = args;
      try {
        await prisma.skill.delete({ where: { id } });
        return true;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
