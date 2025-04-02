import { isAdmin, canPerformAction } from "../rules";
import { and } from "graphql-shield";
export const studentProfilePermissions = {
  Query: {
    studentProfileById: canPerformAction("studentProfile", "view"),
    studentProfiles: isAdmin,
  },
  Mutation: {
    createStudentProfile: and(
      canPerformAction("user", "update", "input.userId"),
      canPerformAction("studentProfile", "create")
    ),
    updateStudentProfile: canPerformAction("studentProfile", "update"),
    deleteStudentProfile: canPerformAction("studentProfile", "delete"),
  },
};
