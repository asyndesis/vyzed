import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Server-only: validated once at startup, so a missing variable fails loudly.
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Vyzed <onboarding@resend.dev>"),
    // Comma-separated origins allowed to call /graphql from a browser
    CORS_ORIGINS: z
      .string()
      .default("")
      .transform((s) =>
        s
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
      ),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
