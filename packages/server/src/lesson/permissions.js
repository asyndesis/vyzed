import { isAuthed, canPerformAction } from "../rules";

export const lessonPermissions = {
  Query: {
    myLessonsAsStudent: isAuthed,
    myLessonsAsTeacher: isAuthed,
  },
  Mutation: {
    requestLesson: isAuthed,
    changeLessonStatus: canPerformAction("lesson", "changeStatus", "lessonId"),
  },
};
