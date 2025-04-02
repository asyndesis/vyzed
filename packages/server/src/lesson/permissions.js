import { isAuthed, canPerformAction } from "../rules";

export const lessonPermissions = {
  Query: {
    myLessonsAsStudent: isAuthed,
    myLessonsAsTeacher: isAuthed,
  },
  Mutation: {
    requestLesson: isAuthed,
    approveLesson: canPerformAction("lesson", "approve", "lessonId"),
    rejectLesson: canPerformAction("lesson", "reject", "lessonId"),
  },
};
