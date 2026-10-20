import { Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/$locale/_login/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password · Vyzed" }] }),
  component: () => (
    <Suspense>
      <AuthForm mode="forgot-password" />
    </Suspense>
  ),
});
