import { isAuthed } from "../rules";

export const sequenceBatchPermissions = {
  Query: {
    sequenceBatches: isAuthed,
    sequenceBatch: isAuthed,
  },
  Mutation: {
    createSequenceBatch: isAuthed,
  },
  sequenceBatch: {
    sequences: isAuthed,
  },
};
