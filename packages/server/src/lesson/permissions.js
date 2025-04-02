import { isAuthed, canPerformAction } from "../rules";

export const lessonPermissions = {
  Query: {
    myLessonsAsStudent: isAuthed,
    myLessonsAsTeacher: isAuthed,
  },
  Mutation: {
    requestLesson: isAuthed,
    approveLesson: canPerformAction("lesson", "approve"),
    rejectLesson: canPerformAction("lesson", "reject"),
  },
};
