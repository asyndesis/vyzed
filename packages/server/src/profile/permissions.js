import { isAuthed } from "../rules";

export const profilePermissions = {
  Query: {
    profileById: isAuthed,
    profilesByUserId: isAuthed,
    profiles: isAuthed,
  },
  Mutation: {
    createProfile: isAuthed,
    updateProfile: isAuthed,
    deleteProfile: isAuthed,
  },
};
