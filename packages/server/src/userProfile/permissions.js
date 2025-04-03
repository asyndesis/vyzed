import { and } from "graphql-shield";
import { isAdmin, isAuthed, canPerformAction } from "../rules";

export const userProfilePermissions = {
  Query: {
    userProfileById: canPerformAction("userProfile", "view"),
    userProfileByUserId: canPerformAction("userProfile", "view", "userId"),
    userProfiles: and(isAuthed, isAdmin),
  },
  Mutation: {
    updateUserProfile: canPerformAction("userProfile", "update"),
  },
};
