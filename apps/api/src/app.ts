import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { env } from "./env";
import { type AppEnv, sessionMiddleware } from "./lib/middleware";
import { bookingRoutes } from "./routes/bookings";
import { meRoutes } from "./routes/me";
import { teacherSelfRoutes } from "./routes/teacher";
import { teacherRoutes } from "./routes/teachers";

export const app = new Hono<AppEnv>()
  .use(logger())
  .use(
    "/api/*",
    cors({
      origin: env.WEB_URL,
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .get("/health", (c) => c.json({ ok: true }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .use("/api/*", sessionMiddleware)
  .route("/api/me", meRoutes)
  .route("/api/teachers", teacherRoutes)
  .route("/api/teacher", teacherSelfRoutes)
  .route("/api/bookings", bookingRoutes);

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

/** Imported by the web app for the typed RPC client. */
export type AppType = typeof app;
