import { prisma } from "@vyzed/prisma";

export const userResolvers = {
  User: {
    studentProfile: async (parent) => {
      return prisma.studentProfile.findUnique({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
    },
    teacherProfiles: async (parent) => {
      return prisma.teacherProfile.findMany({
        where: { userId: parent.id },
        include: { skills: { include: { skill: true } } },
      });
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
    createMyUser: async (parent, args, { user }) => {
      const { input } = args; // Use 'input' as per your generated types
      const { authId } = user;
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
      const { id, input } = args; // Use 'id' and 'input' from args
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
      const { id } = args; // Use 'id' from args
      try {
        await prisma.user.delete({ where: { id } });
        return true; // Return a Boolean as per your schema
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
