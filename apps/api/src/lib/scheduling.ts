import { AvailabilityModel, BookingModel, type ClientSession, type Types } from "@vyzed/db";
import { ACTIVE_BOOKING_STATUSES, generateSlots } from "@vyzed/shared";

export async function getAvailableSlots(
  teacherId: Types.ObjectId,
  from: Date,
  to: Date,
  durationMinutes: number,
  session: ClientSession | null = null,
) {
  const availability = await AvailabilityModel.findOne({ teacherId }).session(session).lean();
  if (!availability) return [];

  const busy = await BookingModel.find(
    {
      teacherId,
      status: { $in: ACTIVE_BOOKING_STATUSES },
      startUtc: { $lt: to },
      endUtc: { $gt: from },
    },
    { startUtc: 1, endUtc: 1 },
  )
    .session(session)
    .lean();

  return generateSlots({
    rules: availability.rules,
    timezone: availability.timezone,
    from,
    to,
    durationMinutes,
    busy: busy.map((b) => ({ start: b.startUtc, end: b.endUtc })),
  });
}
