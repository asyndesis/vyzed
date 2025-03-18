import { and } from "graphql-shield";
import { isAdmin, isAuthed, isClerkAuthed } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: and(isAuthed, isAdmin),
    userByAuthId: and(isAuthed, isAdmin),
    users: and(isAuthed, isAdmin),
    checkUserExistsByAuthId: isAuthed,
  },
  Mutation: {
    createUser: and(isAuthed, isAdmin),
    createMyUser: isClerkAuthed,
  },
};
