import { describe, expect, it } from "vitest";
import {
  LESSON_STATUSES,
  canTransition,
  isSettled,
} from "@/features/lessons/lib/rules";

describe("canTransition", () => {
  it("only lets a teacher complete a confirmed lesson", () => {
    for (const from of LESSON_STATUSES)
      expect(canTransition("teacher", from, "COMPLETED")).toBe(
        from === "CONFIRMED",
      );
  });

  it("never lets a student confirm or complete their own lesson", () => {
    expect(canTransition("student", "REQUESTED", "CONFIRMED")).toBe(false);
    for (const from of LESSON_STATUSES)
      expect(canTransition("student", from, "COMPLETED")).toBe(false);
  });

  it("lets a student accept a teacher's revision", () => {
    expect(canTransition("student", "REVISED", "CONFIRMED")).toBe(true);
  });
});

describe("isSettled", () => {
  it("needs both sides to confirm payment", () => {
    const paid = "2026-01-05T10:00:00Z";
    expect(isSettled({ teacherPaidAt: paid, studentPaidAt: paid })).toBe(true);
    expect(isSettled({ teacherPaidAt: paid, studentPaidAt: null })).toBe(false);
    expect(isSettled({ teacherPaidAt: null, studentPaidAt: null })).toBe(false);
  });
});
