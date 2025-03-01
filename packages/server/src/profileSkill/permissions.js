import { isAuthed } from "../rules";

export const profileSkillPermissions = {
  Query: {
    profileSkillById: isAuthed,
    profileSkillsByProfileId: isAuthed,
    profileSkillsBySkillId: isAuthed,
    profileSkills: isAuthed,
  },
  Mutation: {
    createProfileSkill: isAuthed,
    updateProfileSkill: isAuthed,
    deleteProfileSkill: isAuthed,
  },
};
