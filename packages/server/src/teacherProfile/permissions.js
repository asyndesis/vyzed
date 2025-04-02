import { canPerformAction } from "../rules";
import { and } from "graphql-shield";
export const teacherProfilePermissions = {
  Query: {
    teacherProfileById: canPerformAction("teacherProfile", "view"),
  },
  Mutation: {
    createTeacherProfile: and(
      canPerformAction("user", "update", "input.userId"),
      canPerformAction("teacherProfile", "create")
    ),
    updateTeacherProfile: canPerformAction("teacherProfile", "update"),
    deleteTeacherProfile: canPerformAction("teacherProfile", "delete"),
  },
};
