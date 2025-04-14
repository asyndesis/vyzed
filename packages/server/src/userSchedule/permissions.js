import { canPerformAction, isAuthed } from "../rules";

export const userSchedulePermissions = {
  Query: {
    userSchedule: isAuthed,
  },
  Mutation: {
    // Allow authenticated users to manage slots on their own schedule
    createUserScheduleSlot: canPerformAction(
      "userSchedule",
      "update",
      "input.userScheduleId"
    ),
    updateUserScheduleSlot: canPerformAction(
      "userScheduleSlot",
      "update",
      "id"
    ),
    deleteUserScheduleSlot: canPerformAction(
      "userScheduleSlot",
      "delete",
      "id"
    ),
  },
};
