import { isAuthed, canPerformAction } from "../rules";

export const lessonPermissions = {
  Query: {
    myLessonsAsStudent: isAuthed,
    myLessonsAsTeacher: isAuthed,
  },
  Mutation: {
    requestLesson: isAuthed,
    changeLessonStatus: canPerformAction("lesson", "update", "lessonId"),
    changeEnrollmentStatus: canPerformAction(
      "enrollment",
      "update",
      "enrollmentId"
    ),
    updateEnrollmentPaymentStatus: canPerformAction(
      "enrollment",
      "update",
      "enrollmentId"
    ),
    cancelEnrollment: canPerformAction("enrollment", "update", "enrollmentId"),
  },
};
