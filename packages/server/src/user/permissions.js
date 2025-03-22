import { and } from "graphql-shield";
import { isAdmin, isAuthed, isClerkAuthed, isPublic } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: and(isAuthed, isAdmin),
    userByAuthId: and(isAuthed, isAdmin),
    users: and(isAuthed, isAdmin),
    checkUserExistsByAuthId: isAuthed,
    publicTeacherUsers: isPublic,
    publicUserById: isPublic,
  },
  Mutation: {
    createUser: and(isAuthed, isAdmin),
    createMyUser: isClerkAuthed,
  },
};
