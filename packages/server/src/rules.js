import { rule } from "graphql-shield";
import { ROLES } from "@vyzed/permissions";

export const isAuthed = rule()(async (parent, args, context) => {
  return !!context?.user?.authId; // Check if user is authenticated
});

export const isAdmin = rule()(async (parent, args, context) => {
  return context.user?.roles?.includes(ROLES.admin);
});
