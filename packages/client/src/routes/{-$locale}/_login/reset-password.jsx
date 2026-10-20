import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/{-$locale}/_login/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · Vyzed" }] }),
  component: () => <AuthForm mode="reset-password" />,
});
