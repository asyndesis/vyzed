import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/features/auth/auth-forms";

export const Route = createFileRoute("/_public/_auth/reset-password")({
  head: () => ({ meta: [{ title: "Reset password · Vyzed" }] }),
  component: () => {
    const { token, error } = Route.useSearch();
    return <ResetPasswordForm token={token} expired={!!error} />;
  },
});
