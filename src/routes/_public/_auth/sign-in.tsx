import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "@/features/auth/auth-forms";

export const Route = createFileRoute("/_public/_auth/sign-in")({
  head: () => ({ meta: [{ title: "Sign in · Vyzed" }] }),
  component: () => {
    const { redirect, reset } = Route.useSearch();
    return <SignInForm redirect={redirect} passwordReset={reset} />;
  },
});
