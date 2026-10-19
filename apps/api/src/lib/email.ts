import { Resend } from "resend";
import { env } from "../env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!resend) {
    console.info(`\n[email] to=${to} subject="${subject}"\n${text}\n`);
    return;
  }
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, text });
  if (error) throw new Error(`Failed to send email: ${error.message}`);
}
