import { prisma } from "@vyzed/prisma";

export const mailingListResolvers = {
  Mutation: {
    addToMailingList: async (parent, args, context) => {
      const { input } = args;
      try {
        // Check if the email already exists in the mailing list
        const existingEntry = await prisma.mailingList.findUnique({
          where: { email: input.email },
        });

        // If it already exists, just return true without an error
        if (existingEntry) {
          return true;
        }

        // Get the user ID if the user is authenticated
        const userId = context?.user?.id;

        // Create a new entry in the mailing list
        await prisma.mailingList.create({
          data: {
            email: input.email,
            createdBy: userId || null,
            updatedBy: userId || null,
          },
        });

        return true;
      } catch (err) {
        console.error("Error adding to mailing list:", err);
        // Return false instead of throwing an error to maintain privacy
        // and avoid exposing internal errors to the client
        return false;
      }
    },
  },
};
