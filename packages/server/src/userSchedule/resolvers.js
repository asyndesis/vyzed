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
    createUserScheduleSlot: async (_, { input }, { user, prisma }) => {
      const { userScheduleId, ...slotData } = input;

      try {
        // Optional: Check if the user owns the schedule they are adding a slot to
        const schedule = await prisma.userSchedule.findUnique({
          where: { id: userScheduleId },
        });
        if (!schedule) {
          throw new Error("Schedule not found");
        }

        const slot = await prisma.userScheduleSlot.create({
          data: {
            ...slotData,
            userScheduleId,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return slot;
      } catch (err) {
        console.error("Error creating user schedule slot:", err);
        throw new Error(`Failed to create schedule slot: ${err.message}`);
      }
    },
    updateUserScheduleSlot: async (_, { id, input }, { user, prisma }) => {
      try {
        // Optional: Check if the user owns the schedule containing the slot
        const slot = await prisma.userScheduleSlot.findUnique({
          where: { id },
        });
        if (!slot) {
          throw new Error("Slot not found");
        }

        return await prisma.userScheduleSlot.update({
          where: { id },
          data: {
            ...input,
            updatedBy: user.id,
          },
        });
      } catch (err) {
        console.error("Error updating user schedule slot:", err);
        throw new Error(`Failed to update schedule slot: ${err.message}`);
      }
    },
    deleteUserScheduleSlot: async (_, { id }, { prisma }) => {
      try {
        // Optional: Check if the user owns the schedule containing the slot
        const slot = await prisma.userScheduleSlot.findUnique({
          where: { id },
        });
        if (!slot) {
          throw new Error("Slot not found");
        }

        await prisma.userScheduleSlot.delete({ where: { id } });
        return true; // Indicate success
      } catch (err) {
        console.error("Error deleting user schedule slot:", err);
        throw new Error(`Failed to delete schedule slot: ${err.message}`);
        // return false; // Indicate failure if preferred
      }
    },
  },
};
