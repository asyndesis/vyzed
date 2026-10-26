import { LESSON_STATUSES, PAYMENT_TYPES } from "@/features/lessons/lib/rules";
import { SKILL_FRAMEWORKS, SKILL_KINDS } from "@/lib/skills";
import { builder } from "@/server/graphql/builder";

export const LessonStatusEnum = builder.enumType("LessonStatus", {
  values: LESSON_STATUSES,
});
export const PaymentTypeEnum = builder.enumType("PaymentType", {
  values: PAYMENT_TYPES,
});
export const SkillKindEnum = builder.enumType("SkillKind", {
  values: SKILL_KINDS,
});
export const SkillFrameworkEnum = builder.enumType("SkillFramework", {
  values: SKILL_FRAMEWORKS,
});
