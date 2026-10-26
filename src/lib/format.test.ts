import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatPrice,
  friendlyDay,
  fullName,
  initials,
  timeRange,
} from "@/lib/format";

describe("fullName", () => {
  it("uses the last name when known, otherwise the initial", () => {
    expect(fullName({ id: "1", firstName: "Ada", lastName: "Lovelace" })).toBe(
      "Ada Lovelace",
    );
    expect(fullName({ id: "1", firstName: "Ada", lastInitial: "L" })).toBe(
      "Ada L.",
    );
  });

  it("falls back when there's no name", () => {
    expect(fullName({ id: "1" })).toBe("Unnamed");
    expect(fullName(null)).toBe("Unnamed");
  });
});

describe("initials", () => {
  it("takes the first letters, upper-cased", () => {
    expect(initials({ id: "1", firstName: "ada", lastInitial: "l" })).toBe(
      "AL",
    );
    expect(initials(undefined)).toBe("?");
  });
});

describe("formatPrice", () => {
  it("treats zero as free", () => {
    expect(formatPrice(0)).toBeNull();
  });

  it("hides cents on whole amounts", () => {
    expect(formatPrice(2500)).toMatch(/25(?![.,]\d)/);
    expect(formatPrice(2550)).toMatch(/25[.,]50/);
  });
});

describe("friendlyDay", () => {
  afterEach(() => vi.useRealTimers());

  it("says Today and Tomorrow, then the date", () => {
    vi.useFakeTimers({ now: new Date(2026, 0, 5, 12) });
    expect(friendlyDay(new Date(2026, 0, 5, 18))).toBe("Today");
    expect(friendlyDay(new Date(2026, 0, 6, 9))).toBe("Tomorrow");
    expect(friendlyDay(new Date(2026, 0, 9, 9))).toBe("Fri, Jan 9");
  });
});

describe("timeRange", () => {
  it("shows start and end in 24-hour time", () => {
    expect(
      timeRange(new Date(2026, 0, 5, 9, 30), new Date(2026, 0, 5, 10, 30)),
    ).toBe("09:30–10:30");
  });
});
