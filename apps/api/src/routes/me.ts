import { zValidator } from "@hono/zod-validator";
import { TeacherProfileModel } from "@vyzed/db";
import { setRoleInput } from "@vyzed/shared";
import { Hono } from "hono";
import { auth } from "../auth";
import { type AuthedEnv, requireUser } from "../lib/middleware";

export const meRoutes = new Hono<AuthedEnv>()
  .use(requireUser)
  .get("/", async (c) => {
    const user = c.get("user");
    const hasTeacherProfile =
      user.role === "teacher" && (await TeacherProfileModel.exists({ userId: user.id })) !== null;
    return c.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role ?? null },
      hasTeacherProfile,
    });
  })
  .post("/role", zValidator("json", setRoleInput), async (c) => {
    const user = c.get("user");
    if (user.role) return c.json({ error: "Role already set" }, 409);
    const ctx = await auth.$context;
    await ctx.internalAdapter.updateUser(user.id, { role: c.req.valid("json").role });
    return c.json({ ok: true });
  });
