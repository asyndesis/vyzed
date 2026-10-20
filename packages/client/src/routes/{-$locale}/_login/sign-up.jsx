import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/{-$locale}/_login/sign-up")({
  head: () => ({ meta: [{ title: "Create account · Vyzed" }] }),
  component: () => <AuthForm mode="sign-up" />,
});
