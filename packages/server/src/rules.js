import { rule } from "graphql-shield";
import { ROLES, hasPermission } from "@vyzed/permissions";
import get from "lodash/get";

// User has a clerk auth, but may not yet have a user in our database
export const isClerkAuthed = rule()(async (parent, args, context) => {
  return !!context?.auth?.userId;
});

// User has a user in our database and clerk added it to the context
export const isAuthed = rule()(async (parent, args, context) => {
  return !!context?.user?.authId;
});

export const isAdmin = rule()(async (parent, args, context) => {
  return context.user?.roles?.includes(ROLES.admin);
});

export const isPublic = rule()(async () => {
  return true; // Always allow access
});

export const canPerformAction = (resource, verb, queryIdPath = "id") =>
  rule()(async (_, args, { user, prisma }) => {
    if (!user) return false;

    const id = get(args, queryIdPath);
    if (id) {
      const data = await prisma[resource].findUnique({
        where: { id },
      });
      return hasPermission(user, verb, resource, data);
    }

    return hasPermission(user, verb, resource);
  });
