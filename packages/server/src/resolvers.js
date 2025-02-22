import { sequenceBatchResolvers } from "./sequenceBatch/resolvers";
import { sequenceResolvers } from "./sequence/resolvers";
import { userResolvers } from "./user/resolvers";

export const resolvers = {
  ...sequenceBatchResolvers,
  ...sequenceResolvers,
  ...userResolvers,
  Query: {
    ...sequenceBatchResolvers.Query,
    ...userResolvers.Query,
    ...sequenceResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...sequenceResolvers.Mutation,
    ...sequenceBatchResolvers.Mutation,
  },
};
