import { shield } from "graphql-shield";
import { isAuthed } from "./rules";
import { userPermissions } from "./user/permissions";
import { profilePermissions } from "./profile/permissions";
import { skillPermissions } from "./skill/permissions";
import { profileSkillPermissions } from "./profileSkill/permissions";
import dotenv from "dotenv";

dotenv.config();

export const permissions = shield(
  {
    ...userPermissions,
    ...profilePermissions,
    ...skillPermissions,
    ...profileSkillPermissions,

    Query: {
      "*": isAuthed,
      ...userPermissions.Query,
      ...profilePermissions.Query,
      ...skillPermissions.Query,
      ...profileSkillPermissions.Query,
    },
    Mutation: {
      "*": isAuthed,
      ...userPermissions.Mutation,
      ...profilePermissions.Mutation,
      ...skillPermissions.Mutation,
      ...profileSkillPermissions.Mutation,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV === "development", // This allows custom errors to pass through
  }
);
