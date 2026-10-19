import { describe, expect, it } from "vitest";
import { generateSlots } from "./slots";

const iso = (dates: Date[]) => dates.map((d) => d.toISOString());
const longAgo = new Date("2000-01-01T00:00:00Z");

describe("generateSlots", () => {
  it("expands a weekly rule in the teacher's time zone", () => {
    const slots = generateSlots({
      rules: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }], // Mon 09:00–11:00
      timezone: "America/New_York",
      from: new Date("2026-01-12T00:00:00Z"),
      to: new Date("2026-01-13T00:00:00Z"),
      durationMinutes: 60,
      now: longAgo,
    });
    // EST = UTC-5
    expect(iso(slots)).toEqual([
      "2026-01-12T14:00:00.000Z",
      "2026-01-12T14:30:00.000Z",
      "2026-01-12T15:00:00.000Z",
    ]);
  });

  it("keeps local wall-clock time across a DST change", () => {
    const rules = [{ weekday: 0, startMinute: 9 * 60, endMinute: 10 * 60 }]; // Sun 09:00–10:00
    const opts = { rules, timezone: "Europe/Berlin", durationMinutes: 60, now: longAgo };
    const before = generateSlots({
      ...opts,
      from: new Date("2026-03-22T00:00:00Z"),
      to: new Date("2026-03-23T00:00:00Z"),
    });
    const after = generateSlots({
      ...opts,
      from: new Date("2026-03-29T00:00:00Z"),
      to: new Date("2026-03-30T00:00:00Z"),
    });
    expect(iso(before)).toEqual(["2026-03-22T08:00:00.000Z"]); // CET  (UTC+1)
    expect(iso(after)).toEqual(["2026-03-29T07:00:00.000Z"]); // CEST (UTC+2)
  });

  it("excludes slots overlapping busy time and inside the notice window", () => {
    const slots = generateSlots({
      rules: [{ weekday: 1, startMinute: 9 * 60, endMinute: 12 * 60 }],
      timezone: "UTC",
      from: new Date("2026-01-12T00:00:00Z"),
      to: new Date("2026-01-13T00:00:00Z"),
      durationMinutes: 60,
      busy: [{ start: new Date("2026-01-12T10:00:00Z"), end: new Date("2026-01-12T11:00:00Z") }],
      now: new Date("2026-01-12T08:15:00Z"),
      minNoticeMinutes: 60,
    });
    // 09:00 is inside notice window (< 09:15); 09:30–10:30 and 10:00–11:00 and 10:30–11:30 overlap busy.
    expect(iso(slots)).toEqual(["2026-01-12T11:00:00.000Z"]);
  });
});
