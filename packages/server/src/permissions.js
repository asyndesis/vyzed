import { shield } from "graphql-shield";
import { isAuthed } from "./rules";
import { userPermissions } from "./user/permissions";
import { skillPermissions } from "./skill/permissions";
import { studentProfilePermissions } from "./studentProfile/permissions";
import { teacherProfilePermissions } from "./teacherProfile/permissions";
import dotenv from "dotenv";

dotenv.config();

export const permissions = shield(
  {
    ...userPermissions,
    ...skillPermissions,
    ...studentProfilePermissions,
    ...teacherProfilePermissions,

    Query: {
      "*": isAuthed,
      ...userPermissions.Query,
      ...skillPermissions.Query,
      ...studentProfilePermissions.Query,
      ...teacherProfilePermissions.Query,
    },
    Mutation: {
      "*": isAuthed,
      ...userPermissions.Mutation,
      ...skillPermissions.Mutation,
      ...studentProfilePermissions.Mutation,
      ...teacherProfilePermissions.Mutation,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV === "development", // This allows custom errors to pass through
  }
);
