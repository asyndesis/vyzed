import { userResolvers } from "./user/resolvers";
import { skillResolvers } from "./skill/resolvers";

export const resolvers = {
  ...userResolvers,
  ...skillResolvers,
  Query: {
    ...userResolvers.Query,
    ...skillResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...skillResolvers.Mutation,
  },
};
