import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@vyzed/prisma";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Vyzed <onboarding@resend.dev>";

const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn(`[auth] RESEND_API_KEY not set. Email to ${to}: ${subject}`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) console.error("[auth] Failed to send email:", error);
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "https://vyzed.fly.dev",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ],
  database: prismaAdapter(prisma, { provider: "mongodb" }),
  // Prisma generates the ObjectIds
  advanced: { database: { generateId: false } },
  user: {
    fields: { image: "imageUrl" },
    additionalFields: {
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      roles: { type: "string[]", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Vyzed password",
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Vyzed email",
        html: `<p>Welcome to Vyzed! <a href="${url}">Verify your email</a> to get started.</p>`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Create the app profiles alongside every new auth user
        after: async (user) => {
          const audit = { createdBy: user.id, updatedBy: user.id };
          await prisma.$transaction([
            prisma.userProfile.create({ data: { userId: user.id, ...audit } }),
            prisma.studentProfile.create({ data: { userId: user.id, ...audit } }),
            prisma.teacherProfile.create({ data: { userId: user.id, ...audit } }),
            prisma.userSchedule.create({ data: { userId: user.id, ...audit } }),
            prisma.user.update({ where: { id: user.id }, data: audit }),
          ]);
        },
      },
    },
  },
});
