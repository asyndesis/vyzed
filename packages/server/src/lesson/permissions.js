import { isAuthed } from "../rules";

export const lessonPermissions = {
  Query: {
    myRequestedLessons: isAuthed,
    myPendingLessonRequests: isAuthed,
  },
  Mutation: {
    requestLesson: isAuthed,
    approveLessonRequest: isAuthed,
    rejectLessonRequest: isAuthed,
  },
};
