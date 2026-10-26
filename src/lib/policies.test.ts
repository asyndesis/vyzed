import { describe, expect, it } from "vitest";
import { can, type Viewer } from "@/lib/policies";

const teacher: Viewer = { id: "t", role: "user" };
const student: Viewer = { id: "s", role: "user" };
const stranger: Viewer = { id: "x", role: "user" };
const admin: Viewer = { id: "a", role: "admin" };
const enrollment = { studentId: "s", lesson: { teacherId: "t" } };

describe("can", () => {
  it("denies signed-out visitors everything", () => {
    expect(can(null, "user", "viewPrivate", { id: "s" })).toBe(false);
  });

  it("lets people see and edit only their own private profile", () => {
    expect(can(student, "user", "update", { id: "s" })).toBe(true);
    expect(can(stranger, "user", "update", { id: "s" })).toBe(false);
    expect(can(admin, "user", "update", { id: "s" })).toBe(true);
  });

  it("lets only the teacher update a lesson", () => {
    expect(can(teacher, "lesson", "update", { teacherId: "t" })).toBe(true);
    expect(can(student, "lesson", "update", { teacherId: "t" })).toBe(false);
  });

  it("shows an enrollment to both sides, but only the student changes it", () => {
    expect(can(teacher, "enrollment", "view", enrollment)).toBe(true);
    expect(can(stranger, "enrollment", "view", enrollment)).toBe(false);
    expect(can(student, "enrollment", "update", enrollment)).toBe(true);
    expect(can(teacher, "enrollment", "update", enrollment)).toBe(false);
  });

  it("lets either side confirm payment, but not an admin", () => {
    expect(can(teacher, "enrollment", "markPaid", enrollment)).toBe(true);
    expect(can(student, "enrollment", "markPaid", enrollment)).toBe(true);
    expect(can(admin, "enrollment", "markPaid", enrollment)).toBe(false);
  });

  it("keeps skill management to admins", () => {
    expect(can(admin, "skill", "manage", null)).toBe(true);
    expect(can(teacher, "skill", "manage", null)).toBe(false);
  });
});
