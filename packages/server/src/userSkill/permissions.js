import { and, or, rule } from "graphql-shield";
import { isAdmin, isAuthed } from "../rules";
import { hasPermission } from "@vyzed/permissions";

const canManageUserSkill = rule()(async (parent, args, { user, prisma }) => {
  if (!user) return false;

  // For create operation
  if (args.input?.userId) {
    return hasPermission(user, "create", "userSkill", {
      userId: args.input.userId,
    });
  }

  // For update/delete operations
  if (args.id) {
    const userSkill = await prisma.userSkill.findUnique({
      where: { id: args.id },
    });
    if (!userSkill) return false;

    return hasPermission(user, "update", "userSkill", userSkill);
  }

  return false;
});

export const userSkillPermissions = {
  Query: {
    userSkillById: isAuthed,
    userSkillsByUserId: isAuthed,
    userSkillsBySkillId: isAuthed,
    userSkills: and(isAuthed, isAdmin),
  },
  Mutation: {
    createUserSkill: and(isAuthed, or(isAdmin, canManageUserSkill)),
    updateUserSkill: and(isAuthed, or(isAdmin, canManageUserSkill)),
    deleteUserSkill: and(isAuthed, or(isAdmin, canManageUserSkill)),
  },
};
