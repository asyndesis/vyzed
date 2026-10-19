"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CONFIG = {
  "sign-in": {
    title: "Sign in",
    description: "Welcome back to Vyzed",
    submit: "Sign in",
  },
  "sign-up": {
    title: "Create your account",
    description: "Start learning and teaching on Vyzed",
    submit: "Sign up",
  },
  "forgot-password": {
    title: "Forgot password",
    description: "We'll email you a link to reset it",
    submit: "Send reset link",
  },
  "reset-password": {
    title: "Reset password",
    description: "Choose a new password",
    submit: "Reset password",
  },
};

export function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const cfg = CONFIG[mode];
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = params.get("redirect") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const onError = (ctx) => setError(ctx.error.message || "Something went wrong");

    if (mode === "sign-in") {
      await authClient.signIn.email(
        { email: f.email, password: f.password },
        { onSuccess: () => router.replace(redirectTo), onError },
      );
    } else if (mode === "sign-up") {
      await authClient.signUp.email(
        {
          email: f.email,
          password: f.password,
          name: `${f.firstName} ${f.lastName}`.trim(),
          firstName: f.firstName,
          lastName: f.lastName,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () =>
            setNotice("Check your email for a link to verify your account."),
          onError,
        },
      );
    } else if (mode === "forgot-password") {
      await authClient.requestPasswordReset(
        { email: f.email, redirectTo: "/reset-password" },
        {
          onSuccess: () => setNotice("If that email exists, a link is on its way."),
          onError,
        },
      );
    } else {
      await authClient.resetPassword(
        { newPassword: f.password, token: params.get("token") },
        { onSuccess: () => router.replace("/sign-in"), onError },
      );
    }
    setLoading(false);
  };

  const field = (id, label, type = "text", extra = {}) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required {...extra} />
    </div>
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{cfg.title}</CardTitle>
        <CardDescription>{cfg.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "sign-up" && (
            <div className="grid grid-cols-2 gap-2">
              {field("firstName", "First name", "text", {
                autoComplete: "given-name",
              })}
              {field("lastName", "Last name", "text", {
                autoComplete: "family-name",
              })}
            </div>
          )}
          {mode !== "reset-password" &&
            field("email", "Email", "email", { autoComplete: "email" })}
          {mode !== "forgot-password" &&
            field(
              "password",
              mode === "reset-password" ? "New password" : "Password",
              "password",
              {
                minLength: 8,
                autoComplete:
                  mode === "sign-in" ? "current-password" : "new-password",
              },
            )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {cfg.submit}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          {mode === "sign-in" && (
            <>
              <Link href="/sign-up">Create account</Link>
              <Link href="/forgot-password">Forgot password?</Link>
            </>
          )}
          {mode !== "sign-in" && <Link href="/sign-in">Back to sign in</Link>}
        </div>
      </CardContent>
    </Card>
  );
}
