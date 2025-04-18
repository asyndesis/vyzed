export const userScheduleResolvers = {
  UserSchedule: {
    user: async (parent, _, { prisma }) => {
      // If the parent object already has the user, return it
      if (parent.user) {
        return parent.user;
      }
      // Otherwise, fetch it using the userId
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    slots: async (parent, _, { prisma }) => {
      // If the parent object already has the slots, return them
      if (parent.slots) {
        return parent.slots;
      }
      // Otherwise, fetch them using the userScheduleId
      return prisma.userScheduleSlot.findMany({
        where: { userScheduleId: parent.id },
      });
    },
  },
  Query: {
    userSchedule: async (_, { userId }, { prisma }) => {
      // Add permission checks here if needed
      try {
        return await prisma.userSchedule.findUnique({
          where: { userId },
          // Optionally include slots directly
          // include: { slots: true }
        });
      } catch (err) {
        console.error("Error fetching userSchedule:", err);
        throw new Error(
          `Failed to fetch schedule for user ${userId}: ${err.message}`
        );
      }
    },
  },
  Mutation: {
    updateUserScheduleSlots: async (
      _,
      { userScheduleId, slots },
      { user, prisma }
    ) => {
      try {
        // Check if the schedule exists
        const schedule = await prisma.userSchedule.findUnique({
          where: { id: userScheduleId },
        });

        if (!schedule) {
          throw new Error("Schedule not found");
        }

        // Get existing slots for this schedule
        const existingSlots = await prisma.userScheduleSlot.findMany({
          where: { userScheduleId },
        });

        // Create a transaction to handle all database operations atomically
        return await prisma.$transaction(async (tx) => {
          // 1. Delete all slots that aren't in the new list
          const existingSlotIds = existingSlots.map((slot) => slot.id);
          const newSlotIds = slots
            .filter((slot) => slot.id)
            .map((slot) => slot.id);

          const slotIdsToDelete = existingSlotIds.filter(
            (id) => !newSlotIds.includes(id)
          );

          if (slotIdsToDelete.length > 0) {
            await tx.userScheduleSlot.deleteMany({
              where: {
                id: { in: slotIdsToDelete },
              },
            });
          }

          // 2. Process each slot in the input list
          const results = [];

          for (const slotInput of slots) {
            if (slotInput.id) {
              // Update existing slot
              const { id, ...updateData } = slotInput;
              const updatedSlot = await tx.userScheduleSlot.update({
                where: { id },
                data: {
                  ...updateData,
                  updatedBy: user.id,
                },
              });
              results.push(updatedSlot);
            } else {
              // Create new slot
              const newSlot = await tx.userScheduleSlot.create({
                data: {
                  ...slotInput,
                  userScheduleId,
                  createdBy: user.id,
                  updatedBy: user.id,
                },
              });
              results.push(newSlot);
            }
          }

          return results;
        });
      } catch (err) {
        console.error("Error updating user schedule slots:", err);
        throw new Error(`Failed to update schedule slots: ${err.message}`);
      }
    },
  },
};
