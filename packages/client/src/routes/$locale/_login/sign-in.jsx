import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/$locale/_login/sign-in")({
  head: () => ({ meta: [{ title: "Sign in · Vyzed" }] }),
  component: () => (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  ),
});
