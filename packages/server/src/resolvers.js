import { userResolvers } from "./user/resolvers";

export const resolvers = {
  ...userResolvers,
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};
