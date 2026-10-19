import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Reset password · Vyzed" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="reset-password" />
    </Suspense>
  );
}
