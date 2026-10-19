import type { Role } from "@vyzed/shared";
import { createMiddleware } from "hono/factory";
import { auth, type SessionUser } from "../auth";

export interface AppEnv {
  Variables: { user: SessionUser | null };
}

export interface AuthedEnv {
  Variables: { user: SessionUser };
}

export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  await next();
});

export const requireUser = createMiddleware<AuthedEnv>(async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

export const requireRole = (role: Role) =>
  createMiddleware<AuthedEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.role !== role) return c.json({ error: "Forbidden" }, 403);
    await next();
  });
