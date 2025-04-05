import { LessonStatus, PaymentType } from "@vyzed/constants/lesson";
import { gql } from "graphql-tag";

export const LessonStatusEnum = gql`
  enum LessonStatus {
    ${Object.values(LessonStatus).join("\n")}
  }
`;

export const PaymentTypeEnum = gql`
  enum PaymentType {
    ${Object.values(PaymentType).join("\n")}
  }
`;
