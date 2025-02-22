import { shield } from "graphql-shield";
import { isAuthed } from "./rules";
import { userPermissions } from "./user/permissions";
import { sequencePermissions } from "./sequence/permissions";
import dotenv from "dotenv";

dotenv.config();

export const permissions = shield(
  {
    ...userPermissions,
    ...sequencePermissions,
    Query: {
      "*": isAuthed,
      ...userPermissions.Query,
      ...sequencePermissions.Query,
    },
    Mutation: {
      "*": isAuthed,
      ...userPermissions.Mutation,
      ...sequencePermissions.Mutation,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV === "development", // This allows custom errors to pass through
  }
);
