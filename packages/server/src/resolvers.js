import { userResolvers } from "./user/resolvers";
import { skillResolvers } from "./skill/resolvers";
import { studentProfileResolvers } from "./studentProfile/resolvers";
import { teacherProfileResolvers } from "./teacherProfile/resolvers";
import { userProfileResolvers } from "./userProfile/resolvers";
import { mailingListResolvers } from "./mailingList/resolvers";
import { customScalars } from "./scalars";
import { DateTimeResolver } from "graphql-scalars";
import { lessonResolvers } from "./lesson/resolvers";
import { userScheduleResolvers } from "./userSchedule/resolvers";
export const resolvers = {
  // Add custom scalars
  PostgresID: customScalars.PostgresID,
  DateTime: DateTimeResolver,
  ...userResolvers,
  ...skillResolvers,
  ...studentProfileResolvers,
  ...teacherProfileResolvers,
  ...userProfileResolvers,
  ...mailingListResolvers,
  ...lessonResolvers,
  ...userScheduleResolvers,
  Query: {
    ...userResolvers.Query,
    ...skillResolvers.Query,
    ...studentProfileResolvers.Query,
    ...teacherProfileResolvers.Query,
    ...userProfileResolvers.Query,
    ...lessonResolvers.Query,
    ...userScheduleResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...studentProfileResolvers.Mutation,
    ...teacherProfileResolvers.Mutation,
    ...userProfileResolvers.Mutation,
    ...mailingListResolvers.Mutation,
    ...lessonResolvers.Mutation,
    ...userScheduleResolvers.Mutation,
  },
};
