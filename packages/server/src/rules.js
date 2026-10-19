import { rule } from "graphql-shield";
import { ROLES, hasPermission } from "@vyzed/permissions";
import get from "lodash/get";

// User has a valid session
export const isAuthed = rule()(async (parent, args, context) => {
  return !!context?.user?.id;
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
