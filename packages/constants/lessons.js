import { LessonStatus } from "@vyzed/prisma/enums";
const { CONFIRMED, COMPLETED, CANCELLED, REQUESTED, REVISED } = LessonStatus;

// Teachers follow these transitions (lessonwise)
export const VALID_LESSON_STATUS_TRANSITIONS = {
  [REQUESTED]: [CONFIRMED, CANCELLED, REVISED],
  [CONFIRMED]: [COMPLETED, CANCELLED, REVISED],
  [COMPLETED]: [],
  [CANCELLED]: [REVISED],
  [REVISED]: [CANCELLED],
};

// Students follow these transitions (enrollmentwise)
export const VALID_ENROLLMENT_STATUS_TRANSITIONS = {
  [REQUESTED]: [CANCELLED], // Student can cancel their request
  [CONFIRMED]: [CANCELLED], // Student can cancel their confirmed enrollment
  [CANCELLED]: [REQUESTED], // Student can re-request after cancelling or teacher cancelling
  [REVISED]: [CONFIRMED, CANCELLED], // Student approves (CONFIRMED) or rejects (CANCELLED) teacher's revision
};
