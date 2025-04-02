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
    studentProfile: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    teacherProfile: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    userProfile: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    lesson: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
  },
  [ROLES.user]: {
    user: {
      view: (me, user) => user.createdBy === me.id,
      create: false,
      update: (me, user) => user.createdBy === me.id,
      delete: (me, user) => user.createdBy === me.id,
    },
    studentProfile: {
      view: true,
      create: true,
      update: (me, studentProfile) => studentProfile.userId === me.id,
      delete: (me, studentProfile) => studentProfile.userId === me.id,
    },
    teacherProfile: {
      view: true,
      create: true,
      update: (me, teacherProfile) => teacherProfile.userId === me.id,
      delete: (me, teacherProfile) => teacherProfile.userId === me.id,
    },
    userProfile: {
      view: true,
      create: true,
      update: (me, userProfile) => userProfile.userId === me.id,
      delete: (me, userProfile) => userProfile.userId === me.id,
    },
    lesson: {
      view: true,
      create: true,
      approve: (me, lesson) => lesson.teacherId === me.id,
      reject: (me, lesson) => lesson.teacherId === me.id,
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
