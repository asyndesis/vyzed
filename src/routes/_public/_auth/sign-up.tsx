import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/auth-forms";

export const Route = createFileRoute("/_public/_auth/sign-up")({
  head: () => ({ meta: [{ title: "Sign up · Vyzed" }] }),
  component: SignUpForm,
});
