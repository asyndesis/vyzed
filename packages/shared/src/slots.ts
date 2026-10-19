import { TZDate } from "@date-fns/tz";
import type { WeeklyRule } from "./schemas";

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface GenerateSlotsOptions {
  rules: WeeklyRule[];
  /** Teacher's IANA time zone; rules are interpreted in this zone. */
  timezone: string;
  /** Inclusive range start (UTC instant). */
  from: Date;
  /** Exclusive range end (UTC instant). */
  to: Date;
  durationMinutes: number;
  /** Spacing between candidate start times. */
  stepMinutes?: number;
  /** Existing bookings / blocked time that slots must not overlap. */
  busy?: TimeRange[];
  now?: Date;
  /** Slots starting sooner than this after `now` are excluded. */
  minNoticeMinutes?: number;
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/**
 * Expand weekly availability rules into concrete bookable start times (UTC),
 * correctly handling DST transitions in the teacher's time zone.
 */
export function generateSlots({
  rules,
  timezone,
  from,
  to,
  durationMinutes,
  stepMinutes = 30,
  busy = [],
  now = new Date(),
  minNoticeMinutes = 60,
}: GenerateSlotsOptions): Date[] {
  const earliest = Math.max(from.getTime(), now.getTime() + minNoticeMinutes * MINUTE);
  const latest = to.getTime();
  const durationMs = durationMinutes * MINUTE;
  const starts = new Set<number>();

  // Walk local calendar days, starting a day early so windows that cross UTC midnight are kept.
  const first = new TZDate(from.getTime() - DAY, timezone);
  let day = new TZDate(first.getFullYear(), first.getMonth(), first.getDate(), timezone);

  while (day.getTime() < latest) {
    for (const rule of rules) {
      if (rule.weekday !== day.getDay()) continue;
      for (let m = rule.startMinute; m + durationMinutes <= rule.endMinute; m += stepMinutes) {
        const start = new TZDate(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          0,
          m,
          timezone,
        ).getTime();
        const end = start + durationMs;
        if (start < earliest || end > latest) continue;
        if (busy.some((b) => start < b.end.getTime() && end > b.start.getTime())) continue;
        starts.add(start);
      }
    }
    day = new TZDate(day.getFullYear(), day.getMonth(), day.getDate() + 1, timezone);
  }

  return [...starts].sort((a, b) => a - b).map((t) => new Date(t));
}
