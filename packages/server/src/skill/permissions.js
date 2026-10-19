import { and } from "graphql-shield";
import { isAdmin, isAuthed, isPublic } from "../rules";

export const skillPermissions = {
  Query: {
    skillById: isPublic,
    skillsByParentId: isPublic,
    rootSkills: isPublic,
    allSkills: isPublic,
  },
  Mutation: {
    createSkill: and(isAuthed, isAdmin),
    updateSkill: and(isAuthed, isAdmin),
    deleteSkill: and(isAuthed, isAdmin),
  },
};
