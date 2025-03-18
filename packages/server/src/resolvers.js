import { userResolvers } from "./user/resolvers";
import { skillResolvers } from "./skill/resolvers";
import { studentProfileResolvers } from "./studentProfile/resolvers";
import { teacherProfileResolvers } from "./teacherProfile/resolvers";
import { customScalars } from "./scalars";
import { DateTimeResolver } from "graphql-scalars";

export const resolvers = {
  // Add custom scalars
  PostgresID: customScalars.PostgresID,
  DateTime: DateTimeResolver,
  ...userResolvers,
  ...skillResolvers,
  ...studentProfileResolvers,
  ...teacherProfileResolvers,

  Query: {
    ...userResolvers.Query,
    ...skillResolvers.Query,
    ...studentProfileResolvers.Query,
    ...teacherProfileResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...studentProfileResolvers.Mutation,
    ...teacherProfileResolvers.Mutation,
  },
};
