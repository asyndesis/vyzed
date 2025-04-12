import { LessonStatus } from "@vyzed/prisma/enums";
const { CONFIRMED, COMPLETED, CANCELLED, REQUESTED } = LessonStatus;

// Define valid lesson status transitions as a constant
export const VALID_LESSON_STATUS_TRANSITIONS = {
  [REQUESTED]: [CONFIRMED, CANCELLED],
  [CONFIRMED]: [COMPLETED, CANCELLED],
  [COMPLETED]: [REQUESTED],
  [CANCELLED]: [REQUESTED],
};

// Define valid enrollment status transitions for a student
export const VALID_ENROLLMENT_STATUS_TRANSITIONS = {
  [REQUESTED]: [CANCELLED], // Student can cancel their request
  [CONFIRMED]: [CANCELLED], // Student can cancel their confirmed enrollment
  [CANCELLED]: [REQUESTED], // Student can request a new lesson
  // Add other transitions if needed, e.g., CANCELLED -> REQUESTED ?
};
