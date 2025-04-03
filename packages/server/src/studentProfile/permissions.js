import { isAdmin, canPerformAction } from "../rules";
export const studentProfilePermissions = {
  Query: {
    studentProfileById: canPerformAction("studentProfile", "view"),
    studentProfiles: isAdmin,
  },
  Mutation: {
    updateStudentProfile: canPerformAction("studentProfile", "update"),
  },
};
