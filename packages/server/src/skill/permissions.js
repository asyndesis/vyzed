import { and } from "graphql-shield";
import { isAdmin, isAuthed } from "../rules";

export const skillPermissions = {
  Query: {
    skillById: isAuthed,
    skillsByParentId: isAuthed,
    rootSkills: isAuthed,
    allSkills: isAuthed,
  },
  Mutation: {
    createSkill: and(isAuthed, isAdmin),
    updateSkill: and(isAuthed, isAdmin),
    deleteSkill: and(isAuthed, isAdmin),
  },
};
