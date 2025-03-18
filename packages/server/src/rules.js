import { rule } from "graphql-shield";
import { ROLES, hasPermission } from "@vyzed/permissions";

export const isClerkAuthed = rule()(async (parent, args, context) => {
  return !!context?.auth?.userId; // Check if user is authenticated
});

export const isAuthed = rule()(async (parent, args, context) => {
  return !!context?.user?.authId; // Check if user is authenticated
});

export const isAdmin = rule()(async (parent, args, context) => {
  return context.user?.roles?.includes(ROLES.admin);
});

export const isPublic = rule()(async () => {
  return true; // Always allow access
});

// Generic rules for ABAC permissions
export const canViewResource = (resource) =>
  rule()(async (parent, args, { user, prisma }) => {
    if (!user) return false;

    // For queries that fetch by ID
    if (args.id) {
      const data = await prisma[resource].findUnique({
        where: { id: args.id },
      });
      return hasPermission(user, "view", resource, data);
    }

    // For queries that fetch by userId
    if (args.userId) {
      const data = await prisma[resource].findUnique({
        where: { userId: args.userId },
      });
      return hasPermission(user, "view", resource, data);
    }

    return true; // Default to true for list queries
  });

export const canCreateResource = (resource) =>
  rule()(async (parent, args, { user }) => {
    if (!user) return false;

    // For create operations
    if (args.input) {
      return hasPermission(user, "create", resource, args.input);
    }

    return false;
  });

export const canUpdateResource = (resource) =>
  rule()(async (parent, args, { user, prisma }) => {
    if (!user) return false;

    // For update operations
    if (args.id) {
      const data = await prisma[resource].findUnique({
        where: { id: args.id },
      });
      return hasPermission(user, "update", resource, data);
    }

    return false;
  });

export const canDeleteResource = (resource) =>
  rule()(async (parent, args, { user, prisma }) => {
    if (!user) return false;

    // For delete operations
    if (args.id) {
      const data = await prisma[resource].findUnique({
        where: { id: args.id },
      });
      return hasPermission(user, "delete", resource, data);
    }

    return false;
  });
