import { prisma } from "@vyzed/prisma";
import { hasPermission } from "@vyzed/permissions";
// import { queryApi } from "../utils";

export const sequenceBatchResolvers = {
  Query: {
    sequenceBatches: async () => {
      try {
        return await prisma.sequenceBatch.findMany();
      } catch (err) {
        throw new Error(err);
      }
    },
    sequenceBatch: async (parent, args, context) => {
      const { id } = args;
      try {
        const sequenceBatch = await prisma.sequenceBatch.findUnique({
          where: { id },
        });

        const me = context.user;

        if (!hasPermission(me, sequenceBatch, "view")) {
          throw new Error(
            "You do not have permission to view this sequence group."
          );
        }

        return sequenceBatch;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createSequenceBatch: async (parent, args, context) => {
      const { clerkUserId } = context.user || {};
      const data = args.input;

      // const apiResults = await queryApi({
      //   endpoint: `${process.env.SCIENCE_API_URL}/id`,
      //   params: { sequence: data?.name, species: data?.species },
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${process.env.API_TOKEN}`,
      //   },
      // });

      try {
        const result = await prisma.$transaction(async (prisma) => {
          // Create the sequence batch
          const sequenceBatch = await prisma.sequenceBatch.create({
            data: {
              name: data.name,
              createdBy: clerkUserId,
              updatedBy: clerkUserId,
            },
          });

          const randomCount = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 10

          // Create three associated sequence objects
          await Promise.all(
            Array.from({ length: randomCount }).map((_, i) =>
              prisma.sequence.create({
                data: {
                  sequenceBatchId: sequenceBatch.id,
                  species: data.species,
                  name: `${data.name}_sequence_${i + 1}`, // Example name pattern
                  createdBy: clerkUserId,
                  updatedBy: clerkUserId,
                },
              })
            )
          );

          return sequenceBatch;
        });

        return result;
      } catch (err) {
        throw new Error(
          err.message || "Error creating sequence batch and sequences"
        );
      }
    },
  },
  SequenceBatch: {
    sequences: async (parent) => {
      try {
        return await prisma.sequence.findMany({
          where: { sequenceBatchId: parent.id },
        });
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};
