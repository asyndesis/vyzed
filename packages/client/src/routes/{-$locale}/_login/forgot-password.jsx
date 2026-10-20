import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/{-$locale}/_login/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · Vyzed" }] }),
  component: () => <AuthForm mode="forgot-password" />,
});
