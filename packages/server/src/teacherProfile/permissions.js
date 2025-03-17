import { and, or } from "graphql-shield";
import {
  isAdmin,
  isAuthed,
  isPublic,
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
    teacherProfilesByUserId: and(
      isAuthed,
      or(isAdmin, canViewResource("teacherProfile"))
    ),
    teacherProfiles: isPublic,
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
