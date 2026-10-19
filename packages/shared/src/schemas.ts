import { z } from "zod";
import { isValidTimeZone } from "./timezone";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const timeZoneSchema = z.string().refine(isValidTimeZone, "Invalid IANA time zone");

export const roleSchema = z.enum(["teacher", "learner"]);
export type Role = z.infer<typeof roleSchema>;

export const setRoleInput = z.object({ role: roleSchema });

/** Lesson lengths a learner can book, in minutes. */
export const LESSON_DURATIONS = [30, 60] as const;
export const lessonDurationSchema = z.union([z.literal(30), z.literal(60)]);
export type LessonDuration = z.infer<typeof lessonDurationSchema>;

// ---------- Teacher profile ----------

export const teacherProfileInput = z.object({
  displayName: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(140).default(""),
  bio: z.string().trim().max(4000).default(""),
  subjects: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  languages: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  /** Price per hour in the smallest currency unit (e.g. cents). */
  hourlyRateCents: z.int().min(0).max(1_000_000),
  currency: z.string().length(3).toUpperCase().default("USD"),
  timezone: timeZoneSchema,
  published: z.boolean().default(false),
});
export type TeacherProfileInput = z.infer<typeof teacherProfileInput>;

export const teacherSearchQuery = z.object({
  q: z.string().trim().max(100).optional(),
  subject: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

// ---------- Availability ----------

/** A recurring weekly window in the teacher's local time. */
export const weeklyRuleSchema = z
  .object({
    /** 0 = Sunday … 6 = Saturday */
    weekday: z.int().min(0).max(6),
    /** Minutes since local midnight. */
    startMinute: z.int().min(0).max(1440),
    endMinute: z.int().min(0).max(1440),
  })
  .refine((r) => r.startMinute < r.endMinute, "Start must be before end");
export type WeeklyRule = z.infer<typeof weeklyRuleSchema>;

export const availabilityInput = z.object({
  timezone: timeZoneSchema,
  rules: z.array(weeklyRuleSchema).max(100),
});
export type AvailabilityInput = z.infer<typeof availabilityInput>;

export const slotsQuery = z.object({
  from: z.iso.datetime({ offset: true }),
  to: z.iso.datetime({ offset: true }),
  duration: z.coerce.number().pipe(lessonDurationSchema).default(60),
});

// ---------- Bookings ----------

export const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed"]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

/** Statuses that occupy a teacher's time. */
export const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"] as const satisfies BookingStatus[];

export const createBookingInput = z.object({
  teacherId: objectIdSchema,
  startUtc: z.iso.datetime({ offset: true }),
  durationMinutes: lessonDurationSchema,
  note: z.string().trim().max(1000).optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingInput>;

export const updateBookingInput = z.object({
  status: z.enum(["confirmed", "cancelled"]),
});
