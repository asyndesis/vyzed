import { and, or } from "graphql-shield";
import {
  isAdmin,
  isAuthed,
  canViewResource,
  canCreateResource,
  canUpdateResource,
  canDeleteResource,
} from "../rules";

export const teacherProfilePermissions = {
  Query: {
    teacherProfileById: and(
      isAuthed,
      or(isAdmin, canViewResource("teacherProfile"))
    ),
  },
  Mutation: {
    createTeacherProfile: and(
      isAuthed,
      or(isAdmin, canCreateResource("teacherProfile"))
    ),
    updateTeacherProfile: and(
      isAuthed,
      or(isAdmin, canUpdateResource("teacherProfile"))
    ),
    deleteTeacherProfile: and(
      isAuthed,
      or(isAdmin, canDeleteResource("teacherProfile"))
    ),
  },
};
