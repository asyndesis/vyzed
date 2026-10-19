import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins";
import { env } from "./env";
import { sendEmail } from "./lib/email";
import { mongoClient } from "./lib/mongo";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_URL],
  // Passing the client enables transactions.
  database: mongodbAdapter(mongoClient.db(), { client: mongoClient }),
  user: {
    additionalFields: {
      // "teacher" | "learner"; null until the user finishes onboarding.
      role: { type: "string", required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      async sendVerificationOTP({ email, otp }) {
        await sendEmail({
          to: email,
          subject: `Your Vyzed code: ${otp}`,
          text: `Your Vyzed sign-in code is ${otp}. It expires in 10 minutes.`,
        });
      },
    }),
  ],
});

export type SessionUser = typeof auth.$Infer.Session.user;
