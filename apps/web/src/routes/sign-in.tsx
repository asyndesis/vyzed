import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@vyzed/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vyzed/ui/components/card";
import { Input } from "@vyzed/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@vyzed/ui/components/input-otp";
import { Label } from "@vyzed/ui/components/label";
import { type FormEvent, useState } from "react";
import { z } from "zod";
import { authClient } from "~/lib/auth-client";
import { meQuery } from "~/lib/queries";

export const Route = createFileRoute("/sign-in")({
  validateSearch: z.object({ redirect: z.string().startsWith("/").optional().catch(undefined) }),
  head: () => ({ meta: [{ title: "Sign in · Vyzed" }] }),
  component: SignIn,
});

function SignIn() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    setPending(false);
    if (res.error) return setError(res.error.message ?? "Could not send code");
    setStep("code");
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await authClient.signIn.emailOtp({ email, otp });
    if (res.error) {
      setPending(false);
      return setError(res.error.message ?? "Invalid code");
    }
    const me = await queryClient.fetchQuery({ ...meQuery, staleTime: 0 });
    if (!me?.user.role) return navigate({ to: "/onboarding" });
    return navigate({ to: redirect ?? "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Sign in to Vyzed</CardTitle>
          <CardDescription>
            {step === "email"
              ? "We'll email you a 6-digit code. No password needed."
              : `Enter the code we sent to ${email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={(e) => void sendCode(e)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Email me a code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={(e) => void verify(e)} className="grid gap-4">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" disabled={pending || otp.length !== 6}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep("email")}>
                Use a different email
              </Button>
            </form>
          )}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
