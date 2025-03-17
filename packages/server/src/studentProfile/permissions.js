import { and, or } from "graphql-shield";
import {
  isAdmin,
  isAuthed,
  canViewResource,
  canCreateResource,
  canUpdateResource,
  canDeleteResource,
} from "../rules";

export const studentProfilePermissions = {
  Query: {
    studentProfileById: and(
      isAuthed,
      or(isAdmin, canViewResource("studentProfile"))
    ),
    studentProfileByUserId: and(
      isAuthed,
      or(isAdmin, canViewResource("studentProfile"))
    ),
    studentProfiles: and(isAuthed, isAdmin),
  },
  Mutation: {
    createStudentProfile: and(
      isAuthed,
      or(isAdmin, canCreateResource("studentProfile"))
    ),
    updateStudentProfile: and(
      isAuthed,
      or(isAdmin, canUpdateResource("studentProfile"))
    ),
    deleteStudentProfile: and(
      isAuthed,
      or(isAdmin, canDeleteResource("studentProfile"))
    ),
  },
};
