import { zValidator } from "@hono/zod-validator";
import { AvailabilityModel, BookingModel, mongoose, TeacherProfileModel, Types } from "@vyzed/db";
import {
  ACTIVE_BOOKING_STATUSES,
  type BookingStatus,
  createBookingInput,
  objectIdSchema,
  updateBookingInput,
} from "@vyzed/shared";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { auth } from "../auth";
import { toBookingDto } from "../lib/dto";
import { sendEmail } from "../lib/email";
import { type AuthedEnv, requireUser } from "../lib/middleware";
import { mongoClient } from "../lib/mongo";
import { getAvailableSlots } from "../lib/scheduling";

const MINUTE = 60_000;
const isActive = (s: BookingStatus) => (ACTIVE_BOOKING_STATUSES as readonly string[]).includes(s);

async function userNames(ids: Types.ObjectId[]) {
  const users = await mongoClient
    .db()
    .collection<{ _id: Types.ObjectId; name: string; email: string }>("user")
    .find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } })
    .toArray();
  return new Map(users.map((u) => [u._id.toString(), u.name || u.email]));
}

export const bookingRoutes = new Hono<AuthedEnv>()
  .use(requireUser)
  .get("/", async (c) => {
    const userId = new Types.ObjectId(c.get("user").id);
    const bookings = await BookingModel.find({
      $or: [{ teacherId: userId }, { learnerId: userId }],
      endUtc: { $gte: new Date(Date.now() - 7 * 24 * 60 * MINUTE) },
    })
      .sort({ startUtc: 1 })
      .limit(200)
      .lean();

    const teacherIds = [...new Set(bookings.map((b) => b.teacherId.toString()))];
    const [profiles, learners] = await Promise.all([
      TeacherProfileModel.find(
        { userId: { $in: teacherIds } },
        { userId: 1, displayName: 1 },
      ).lean(),
      userNames(bookings.map((b) => b.learnerId)),
    ]);
    const teacherNames = new Map(profiles.map((p) => [p.userId.toString(), p.displayName]));

    return c.json({
      bookings: bookings.map((b) =>
        toBookingDto(b, userId.toString(), {
          teacher: teacherNames.get(b.teacherId.toString()) ?? "Teacher",
          learner: learners.get(b.learnerId.toString()) ?? "Learner",
        }),
      ),
    });
  })
  .post("/", zValidator("json", createBookingInput), async (c) => {
    const user = c.get("user");
    const input = c.req.valid("json");
    if (input.teacherId === user.id) return c.json({ error: "You can't book yourself" }, 400);

    const teacherId = new Types.ObjectId(input.teacherId);
    const profile = await TeacherProfileModel.findOne({
      userId: teacherId,
      published: true,
    }).lean();
    if (!profile) return c.json({ error: "Teacher not found" }, 404);

    const start = new Date(input.startUtc);
    const end = new Date(start.getTime() + input.durationMinutes * MINUTE);

    const booking = await mongoose.connection.transaction(async (session) => {
      // Writing to the teacher's availability doc makes concurrent booking transactions
      // for the same teacher conflict, so one of them retries and sees the other's booking.
      const touched = await AvailabilityModel.updateOne(
        { teacherId },
        { $inc: { bookingSeq: 1 } },
        { session },
      );
      if (touched.matchedCount === 0) {
        throw new HTTPException(409, { message: "Teacher has no availability" });
      }

      const slots = await getAvailableSlots(teacherId, start, end, input.durationMinutes, session);
      if (!slots.some((s) => s.getTime() === start.getTime())) {
        throw new HTTPException(409, { message: "That time is no longer available" });
      }

      const [created] = await BookingModel.create(
        [
          {
            teacherId,
            learnerId: new Types.ObjectId(user.id),
            startUtc: start,
            endUtc: end,
            status: "pending",
            priceCents: Math.round((profile.hourlyRateCents * input.durationMinutes) / 60),
            currency: profile.currency,
            note: input.note,
          },
        ],
        { session },
      );
      return created!;
    });

    void notifyTeacher(input.teacherId, user.name || user.email, start).catch((err: unknown) =>
      console.error("Failed to notify teacher", err),
    );

    return c.json(
      {
        booking: toBookingDto(booking.toObject(), user.id, {
          teacher: profile.displayName,
          learner: user.name || user.email,
        }),
      },
      201,
    );
  })
  .patch(
    "/:id",
    zValidator("param", z.object({ id: objectIdSchema })),
    zValidator("json", updateBookingInput),
    async (c) => {
      const userId = c.get("user").id;
      const { status } = c.req.valid("json");
      const booking = await BookingModel.findById(c.req.valid("param").id);
      if (!booking) return c.json({ error: "Booking not found" }, 404);

      const isTeacher = booking.teacherId.toString() === userId;
      const isLearner = booking.learnerId.toString() === userId;
      if (!isTeacher && !isLearner) return c.json({ error: "Booking not found" }, 404);

      if (status === "confirmed" && !(isTeacher && booking.status === "pending")) {
        return c.json({ error: "Only the teacher can confirm a pending booking" }, 409);
      }
      if (status === "cancelled" && !isActive(booking.status)) {
        return c.json({ error: "Booking can no longer be cancelled" }, 409);
      }

      booking.status = status;
      await booking.save();
      return c.json({ ok: true, status });
    },
  );

async function notifyTeacher(teacherId: string, learnerName: string, start: Date) {
  const ctx = await auth.$context;
  const teacher = await ctx.internalAdapter.findUserById(teacherId);
  if (!teacher) return;
  await sendEmail({
    to: teacher.email,
    subject: "New lesson request on Vyzed",
    text: `${learnerName} requested a lesson starting ${start.toISOString()} (UTC). Sign in to confirm it.`,
  });
}
