import { or } from "graphql-shield";
import {
  canPerformAction,
  isAdmin,
  isAuthed,
  isPublic,
} from "../rules";

export const userPermissions = {
  Query: {
    me: isAuthed,
    userById: or(isAdmin, canPerformAction("user", "view")),
    users: isAdmin,
    publicTeacherUsers: isPublic,
    publicUserById: isPublic,
  },
  Mutation: {
    createUser: isAdmin,
  },
  User: {
    lastName: canPerformAction("user", "view"),
    email: canPerformAction("user", "view"),
    roles: canPerformAction("user", "view"),
  },
};
