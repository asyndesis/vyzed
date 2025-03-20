import { and, or } from "graphql-shield";
import {
  isAdmin,
  isAuthed,
  canViewResource,
  canCreateResource,
  canUpdateResource,
  canDeleteResource,
} from "../rules";

export const userProfilePermissions = {
  Query: {
    userProfileById: and(isAuthed, or(isAdmin, canViewResource("userProfile"))),
    userProfileByUserId: and(
      isAuthed,
      or(isAdmin, canViewResource("userProfile"))
    ),
    userProfiles: and(isAuthed, isAdmin),
  },
  Mutation: {
    createUserProfile: and(
      isAuthed,
      or(isAdmin, canCreateResource("userProfile"))
    ),
    updateUserProfile: and(
      isAuthed,
      or(isAdmin, canUpdateResource("userProfile"))
    ),
    deleteUserProfile: and(
      isAuthed,
      or(isAdmin, canDeleteResource("userProfile"))
    ),
  },
};
