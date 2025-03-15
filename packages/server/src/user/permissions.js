import { and } from "graphql-shield";
import { isAdmin, isAuthed, isPublic } from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: and(isAuthed, isAdmin),
    userByAuthId: and(isAuthed, isAdmin),
    users: and(isAuthed, isAdmin),
    getTeachers: isPublic,
  },
  Mutation: {
    createUser: and(isAuthed, isAdmin),
    createMyUser: isAuthed,
  },
};
