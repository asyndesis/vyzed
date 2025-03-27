import { isPublic } from "../rules";

export const mailingListPermissions = {
  Mutation: {
    addToMailingList: isPublic,
  },
};
