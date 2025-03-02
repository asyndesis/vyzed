import { shield } from "graphql-shield";
import { isAuthed } from "./rules";
import { userPermissions } from "./user/permissions";
import { skillPermissions } from "./skill/permissions";
import dotenv from "dotenv";

dotenv.config();

export const permissions = shield(
  {
    ...userPermissions,
    ...skillPermissions,

    Query: {
      "*": isAuthed,
      ...userPermissions.Query,
      ...skillPermissions.Query,
    },
    Mutation: {
      "*": isAuthed,
      ...userPermissions.Mutation,
      ...skillPermissions.Mutation,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV === "development", // This allows custom errors to pass through
  }
);
