import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/features/auth/auth-forms";

export const Route = createFileRoute("/_public/_auth/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · Vyzed" }] }),
  component: ForgotPasswordForm,
});
