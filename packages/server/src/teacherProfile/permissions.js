import { canPerformAction } from "../rules";
export const teacherProfilePermissions = {
  Query: {
    teacherProfileById: canPerformAction("teacherProfile", "view"),
  },
  Mutation: {
    updateTeacherProfile: canPerformAction("teacherProfile", "update"),
  },
};
