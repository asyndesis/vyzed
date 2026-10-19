import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Forgot password · Vyzed" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="forgot-password" />
    </Suspense>
  );
}
