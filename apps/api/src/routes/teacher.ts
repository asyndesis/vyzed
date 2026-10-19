import { zValidator } from "@hono/zod-validator";
import { AvailabilityModel, TeacherProfileModel } from "@vyzed/db";
import { availabilityInput, teacherProfileInput } from "@vyzed/shared";
import { Hono } from "hono";
import { toAvailabilityDto, toTeacherDto } from "../lib/dto";
import { type AuthedEnv, requireRole } from "../lib/middleware";

/** The signed-in teacher's own profile and availability. */
export const teacherSelfRoutes = new Hono<AuthedEnv>()
  .use(requireRole("teacher"))
  .get("/profile", async (c) => {
    const profile = await TeacherProfileModel.findOne({ userId: c.get("user").id }).lean();
    return c.json({ profile: profile ? toTeacherDto(profile) : null });
  })
  .put("/profile", zValidator("json", teacherProfileInput), async (c) => {
    const profile = await TeacherProfileModel.findOneAndUpdate(
      { userId: c.get("user").id },
      { $set: c.req.valid("json") },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
    return c.json({ profile: toTeacherDto(profile) });
  })
  .get("/availability", async (c) => {
    const availability = await AvailabilityModel.findOne({ teacherId: c.get("user").id }).lean();
    return c.json({ availability: availability ? toAvailabilityDto(availability) : null });
  })
  .put("/availability", zValidator("json", availabilityInput), async (c) => {
    const availability = await AvailabilityModel.findOneAndUpdate(
      { teacherId: c.get("user").id },
      { $set: c.req.valid("json") },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
    return c.json({ availability: toAvailabilityDto(availability) });
  });
