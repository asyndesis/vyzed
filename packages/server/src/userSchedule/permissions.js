import { canPerformAction, isAuthed } from "../rules";

export const userSchedulePermissions = {
  Query: {
    userSchedule: isAuthed,
  },
  Mutation: {
    updateUserScheduleSlots: canPerformAction(
      "userScheduleSlot",
      "update",
      "userScheduleId",
    ),
  },
};
