import { LESSON_STATUSES, PAYMENT_TYPES } from "@/domain/lessons";
import { SKILL_FRAMEWORKS, SKILL_KINDS } from "@/domain/skills";
import { builder } from "../builder";

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
