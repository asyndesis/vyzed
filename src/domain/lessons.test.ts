import { describe, expect, it } from "vitest";
import { LESSON_STATUSES, canTransition } from "./lessons";

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
