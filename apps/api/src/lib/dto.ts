import type { Availability, Booking, TeacherProfile, Types } from "@vyzed/db";

type WithId<T> = T & { _id: Types.ObjectId };

export function toTeacherDto(p: TeacherProfile) {
  return {
    id: p.userId.toString(),
    displayName: p.displayName,
    headline: p.headline,
    bio: p.bio,
    subjects: p.subjects,
    languages: p.languages,
    hourlyRateCents: p.hourlyRateCents,
    currency: p.currency,
    timezone: p.timezone,
    avatarUrl: p.avatarUrl ?? null,
    published: p.published,
  };
}
export type TeacherDto = ReturnType<typeof toTeacherDto>;

export function toAvailabilityDto(a: Pick<Availability, "timezone" | "rules">) {
  return {
    timezone: a.timezone,
    rules: a.rules.map(({ weekday, startMinute, endMinute }) => ({
      weekday,
      startMinute,
      endMinute,
    })),
  };
}

export function toBookingDto(
  b: WithId<Booking>,
  viewerId: string,
  names: { teacher: string; learner: string },
) {
  return {
    id: b._id.toString(),
    teacher: { id: b.teacherId.toString(), name: names.teacher },
    learner: { id: b.learnerId.toString(), name: names.learner },
    startUtc: b.startUtc.toISOString(),
    endUtc: b.endUtc.toISOString(),
    status: b.status,
    priceCents: b.priceCents,
    currency: b.currency,
    note: b.note ?? null,
    viewerRole: b.teacherId.toString() === viewerId ? ("teacher" as const) : ("learner" as const),
  };
}
export type BookingDto = ReturnType<typeof toBookingDto>;
