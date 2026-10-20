import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { apiKey } from "@better-auth/api-key";
import { Resend } from "resend";
import { env } from "@/env";
import { db } from "./db";
import * as schema from "./db/schema";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend)
    return console.warn(
      `[auth] RESEND_API_KEY not set. Email to ${to}: ${subject}`,
    );
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) console.error("[auth] Failed to send email:", error);
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    additionalFields: {
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: ({ user, url }) =>
      sendEmail(
        user.email,
        "Reset your Vyzed password",
        `<p><a href="${url}">Reset your password</a></p>`,
      ),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) =>
      sendEmail(
        user.email,
        "Verify your Vyzed email",
        `<p>Welcome to Vyzed! <a href="${url}">Verify your email</a>.</p>`,
      ),
  },
  plugins: [
    admin(), // user.role: "user" | "admin"
    bearer(), // Authorization: Bearer <session token> for external apps
    apiKey({ enableSessionForAPIKeys: true }), // x-api-key for server-to-server, acts as the key's owner
    tanstackStartCookies(), // must be last
  ],
});

export type Session = typeof auth.$Infer.Session;
