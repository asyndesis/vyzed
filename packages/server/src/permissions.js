import { shield } from "graphql-shield";
import { isAuthed } from "./rules";
import { userPermissions } from "./user/permissions";
import { skillPermissions } from "./skill/permissions";
import { studentProfilePermissions } from "./studentProfile/permissions";
import { teacherProfilePermissions } from "./teacherProfile/permissions";
import { userProfilePermissions } from "./userProfile/permissions";
import { mailingListPermissions } from "./mailingList/permissions";
import dotenv from "dotenv";

dotenv.config();

export const permissions = shield(
  {
    ...userPermissions,
    ...skillPermissions,
    ...studentProfilePermissions,
    ...teacherProfilePermissions,
    ...userProfilePermissions,
    ...mailingListPermissions,

    Query: {
      "*": isAuthed,
      ...userPermissions.Query,
      ...skillPermissions.Query,
      ...studentProfilePermissions.Query,
      ...teacherProfilePermissions.Query,
      ...userProfilePermissions.Query,
    },
    Mutation: {
      "*": isAuthed,
      ...userPermissions.Mutation,
      ...skillPermissions.Mutation,
      ...studentProfilePermissions.Mutation,
      ...teacherProfilePermissions.Mutation,
      ...userProfilePermissions.Mutation,
      ...mailingListPermissions.Mutation,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV === "development", // This allows custom errors to pass through
  }
);
