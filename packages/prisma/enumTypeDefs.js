// Generated from Prisma schema - DO NOT EDIT MANUALLY
// To regenerate, run: npm run generate:enums -w @vyzed/prisma

import { gql } from 'graphql-tag';
import { SkillFramework, LessonStatus, PaymentType } from './enums.js';

// GraphQL Enum Definitions
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
  SkillFrameworkEnum,
  LessonStatusEnum,
  PaymentTypeEnum
];
