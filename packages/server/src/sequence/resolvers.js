import { prisma } from "@vyzed/prisma";
import { hasPermission } from "@vyzed/permissions";

export const sequenceResolvers = {
  Query: {
    sequences: async () => {
      try {
        return await prisma.sequence.findMany();
      } catch (err) {
        throw new Error(err);
      }
    },
    sequence: async (parent, args, context) => {
      const { id } = args;
      try {
        const sequence = await prisma.sequence.findUnique({
          where: { id },
        });

        const me = context.user;

        if (!hasPermission(me, "view", "sequence", sequence)) {
          throw new Error("You do not have permission to view this sequence.");
        }

        return sequence;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createSequence: async (parent, args, context) => {
      const { userId: clerkUserId } = context.auth || {};
      const data = args.input;

      try {
        const sequence = await prisma.sequence.create({
          data: { ...data, createdBy: clerkUserId, updatedBy: clerkUserId },
        });
        return sequence;
      } catch (err) {
        throw new Error(err);
      }
    },
    updateSequence: async (parent, args, context) => {
      const { userId: clerkUserId } = context.auth || {};
      const { id, input } = args;

      try {
        const result = await prisma.$transaction(async (prisma) => {
          // Update the sequence
          const updatedSequence = await prisma.sequence.update({
            where: { id },
            data: { ...input, updatedBy: clerkUserId, updatedAt: new Date() },
          });

          // If `name` is updated, check the sequenceBatch
          if (input.name) {
            // Count sequences in the same sequenceBatch
            const sequenceCount = await prisma.sequence.count({
              where: {
                sequenceBatchId: updatedSequence.sequenceBatchId,
              },
            });

            // Update the sequenceBatch only if there's exactly one sequence
            if (sequenceCount === 1) {
              await prisma.sequenceBatch.update({
                where: { id: updatedSequence.sequenceBatchId },
                data: {
                  name: input.name,
                  updatedBy: clerkUserId,
                  updatedAt: new Date(),
                }, // Add any necessary updates
              });
            }
          }

          return updatedSequence;
        });

        return result;
      } catch (err) {
        throw new Error(err.message || "Error updating sequence");
      }
    },
  },
};
