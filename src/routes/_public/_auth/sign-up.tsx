import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/features/auth/auth-forms";

export const Route = createFileRoute("/_public/_auth/sign-up")({
  head: () => ({ meta: [{ title: "Sign up · Vyzed" }] }),
  component: SignUpForm,
});
