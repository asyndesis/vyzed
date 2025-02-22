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
    userByClerkUserId: async (parent, args) => {
      const { clerkUserId } = args;
      try {
        const user = await prisma.user.findUnique({ where: { clerkUserId } });
        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    // Use to be safe for users logging in the first time
    checkClerkUserIdExists: async (parent, args) => {
      const { clerkUserId } = args;
      try {
        const user = await prisma.user.findUnique({ where: { clerkUserId } });
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
    createMyUser: async (parent, args, context) => {
      const { input } = args; // Use 'input' as per your generated types
      const { auth } = context;
      const { userId: clerkUserId } = auth || {};
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
            createdBy: clerkUserId,
            updatedBy: clerkUserId,
            roles: ["user"],
          },
        });
        return newUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    updateUser: async (parent, args, context) => {
      const { id, input } = args; // Use 'id' and 'input' from args
      const { auth } = context;
      const { userId: clerkUserId } = auth || {};
      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            ...input,
            updatedBy: clerkUserId,
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
