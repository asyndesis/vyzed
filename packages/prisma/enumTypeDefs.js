// Generated from Prisma schema - DO NOT EDIT MANUALLY
// To regenerate, run: npm run generate:enums -w @vyzed/prisma

import { gql } from 'graphql-tag';
import { DayOfWeek, UserScheduleSlotType, SkillFramework, LessonStatus, PaymentType } from './enums.js';

// GraphQL Enum Definitions
export const DayOfWeekEnum = gql`
  enum DayOfWeek {
    ${Object.values(DayOfWeek).join('\n    ')}
  }
`;

export const UserScheduleSlotTypeEnum = gql`
  enum UserScheduleSlotType {
    ${Object.values(UserScheduleSlotType).join('\n    ')}
  }
`;

export const SkillFrameworkEnum = gql`
  enum SkillFramework {
    ${Object.values(SkillFramework).join('\n    ')}
  }
`;

export const LessonStatusEnum = gql`
  enum LessonStatus {
    ${Object.values(LessonStatus).join('\n    ')}
  }
`;

export const PaymentTypeEnum = gql`
  enum PaymentType {
    ${Object.values(PaymentType).join('\n    ')}
  }
`;

export const enumTypeDefs = [
  DayOfWeekEnum,
  UserScheduleSlotTypeEnum,
  SkillFrameworkEnum,
  LessonStatusEnum,
  PaymentTypeEnum
];
