import { isAuthed } from "../rules";

export const sequencePermissions = {
  Query: {
    sequences: isAuthed,
    sequence: isAuthed,
  },
  Mutation: {
    createSequence: isAuthed,
  },
};
