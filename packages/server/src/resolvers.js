import { userResolvers } from "./user/resolvers";
import { profileResolvers } from "./profile/resolvers";
import { skillResolvers } from "./skill/resolvers";
import { profileSkillResolvers } from "./profileSkill/resolvers";

export const resolvers = {
  ...userResolvers,
  ...profileResolvers,
  ...skillResolvers,
  ...profileSkillResolvers,
  Query: {
    ...userResolvers.Query,
    ...profileResolvers.Query,
    ...skillResolvers.Query,
    ...profileSkillResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...profileResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...profileSkillResolvers.Mutation,
  },
};
