import { zValidator } from "@hono/zod-validator";
import { TeacherProfileModel, Types } from "@vyzed/db";
import { objectIdSchema, slotsQuery, teacherSearchQuery } from "@vyzed/shared";
import { Hono } from "hono";
import { z } from "zod";
import { toTeacherDto } from "../lib/dto";
import { getAvailableSlots } from "../lib/scheduling";

const PAGE_SIZE = 20;
const MAX_SLOT_RANGE_MS = 31 * 24 * 60 * 60 * 1000;
const idParam = zValidator("param", z.object({ id: objectIdSchema }));

/** Public teacher directory. A teacher's public id is their user id. */
export const teacherRoutes = new Hono()
  .get("/", zValidator("query", teacherSearchQuery), async (c) => {
    const { q, subject, page } = c.req.valid("query");
    const filter: Record<string, unknown> = { published: true };
    if (subject) filter.subjects = subject;
    if (q) filter.$text = { $search: q };

    const query = TeacherProfileModel.find(filter)
      .sort(q ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean();
    const [docs, total] = await Promise.all([query, TeacherProfileModel.countDocuments(filter)]);

    return c.json({ teachers: docs.map(toTeacherDto), total, page, pageSize: PAGE_SIZE });
  })
  .get("/:id", idParam, async (c) => {
    const profile = await TeacherProfileModel.findOne({
      userId: c.req.valid("param").id,
      published: true,
    }).lean();
    if (!profile) return c.json({ error: "Teacher not found" }, 404);
    return c.json({ teacher: toTeacherDto(profile) });
  })
  .get("/:id/slots", idParam, zValidator("query", slotsQuery), async (c) => {
    const { from, to, duration } = c.req.valid("query");
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const range = toDate.getTime() - fromDate.getTime();
    if (range <= 0 || range > MAX_SLOT_RANGE_MS) {
      return c.json({ error: "Range must be between 0 and 31 days" }, 400);
    }
    const slots = await getAvailableSlots(
      new Types.ObjectId(c.req.valid("param").id),
      fromDate,
      toDate,
      duration,
    );
    return c.json({ slots: slots.map((s) => s.toISOString()), duration });
  });
