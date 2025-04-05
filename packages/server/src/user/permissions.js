import { or } from "graphql-shield";
import {
  canPerformAction,
  isAdmin,
  isAuthed,
  isClerkAuthed,
  isPublic,
} from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: or(isAdmin, canPerformAction("user", "view")),
    userByAuthId: isAdmin,
    users: isAdmin,
    checkUserExistsByAuthId: isAuthed,
    publicTeacherUsers: isPublic,
    publicUserById: isPublic,
  },
  Mutation: {
    createUser: isAdmin,
    createMyUser: isClerkAuthed,
  },
  User: {
    lastName: canPerformAction("user", "view"),
    email: canPerformAction("user", "view"),
    authId: canPerformAction("user", "view"),
    roles: canPerformAction("user", "view"),
  },
};
