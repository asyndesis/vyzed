import { prisma } from "@vyzed/prisma";

export const userResolvers = {
  Query: {
    me: async (parent, args, context) => {
      return context?.user;
    },
    userById: async (parent, args) => {
      const { id } = args; // args should have 'id'
      try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    userByAuthId: async (parent, args) => {
      const { authId } = args;
      try {
        const user = await prisma.user.findUnique({ where: { authId } });
        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    // Use to be safe for users logging in the first time
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
        const users = await prisma.user.findMany();
        return users;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    createUser: async (parent, args) => {
      const { input } = args; // Use 'input' as per your generated types
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new Error("User already exists.");
        }

        const newUser = await prisma.user.create({
          data: input,
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
