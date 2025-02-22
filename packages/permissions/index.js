export const ROLES = {
  admin: "admin",
  user: "user",
};

// Uses Attribute-Based Access Control (ABAC)
const PERMISSIONS = {
  [ROLES.admin]: {
    user: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  [ROLES.user]: {
    user: {
      view: (me, user) => user.createdBy === me.clerkUserId,
      create: false,
      update: (me, user) => user.createdBy === me.clerkUserId,
      delete: (me, user) => user.createdBy === me.clerkUserId,
    },
  },
};

// I.E:
// hasPermission(me, "view", "sequence", sequence)
export function hasPermission(user, action, resource, data) {
  if (!user) return false;
  if (!data) return true; // Can view if there is no data on an endpoint
  return user?.roles?.some?.((role) => {
    const permission = PERMISSIONS?.[role]?.[resource]?.[action];
    if (permission == null) return false;

    if (typeof permission === "boolean") return permission;
    return data != null && permission(user, data);
  });
}
