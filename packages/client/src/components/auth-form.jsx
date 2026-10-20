import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck } from "lucide-react";

const CONFIG = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to your Vyzed account.",
    submit: "Sign in",
  },
  "sign-up": {
    title: "Create your account",
    description: "Learn, teach, or swap skills with people near you.",
    submit: "Sign up",
  },
  "forgot-password": {
    title: "Forgot password",
    description: "Enter your email and we'll send you a reset link.",
    submit: "Send reset link",
  },
  "reset-password": {
    title: "Reset password",
    description: "Choose a new password for your account.",
    submit: "Reset password",
  },
};

export function AuthForm({ mode }) {
  const navigate = useNavigate();
  const params = useSearch({ strict: false });
  const cfg = CONFIG[mode];
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const token = params.token;

  // Only same-site paths, never //evil.com
  const redirectTo = /^\/(?!\/)/.test(params.redirect ?? "") ? params.redirect : null;
  const afterSignIn = () =>
    redirectTo
      ? navigate({ href: redirectTo, replace: true })
      : navigate({ to: "/{-$locale}/dashboard", replace: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const onError = (ctx) => {
      if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(f.email);
        setError("Please verify your email before signing in.");
      } else setError(ctx.error.message || "Something went wrong. Please try again.");
    };
    setUnverifiedEmail("");

    if (mode === "sign-in") {
      await authClient.signIn.email(
        { email: f.email, password: f.password },
        { onSuccess: afterSignIn, onError },
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
        { newPassword: f.password, token },
        { onSuccess: () => navigate({ to: "/{-$locale}/sign-in", search: { reset: "1" }, replace: true }), onError },
      );
    }
    setLoading(false);
  };

  const field = (id, label, type = "text", extra = {}, aside = null) => (
    // Grid puts `aside` beside the label visually while it stays after the
    // input in the DOM, so Tab goes field → aside (e.g. Forgot password?)
    <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required {...extra} wrapperClassName="col-span-2" />
      {aside && <div className="col-start-2 row-start-1 text-sm leading-none">{aside}</div>}
    </div>
  );

  const header = (
    <div className="mb-6 space-y-1">
      <h1 className="text-xl font-semibold tracking-tight">{cfg.title}</h1>
      <p className="text-sm text-muted-foreground">{cfg.description}</p>
    </div>
  );

  // After sign-up / reset request, swap the form for a clear confirmation
  if (notice)
    return (
      <div className="space-y-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border">
          <MailCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">{notice}</p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/{-$locale}/sign-in">Back to sign in</Link>
        </Button>
      </div>
    );

  const resend = async () => {
    setLoading(true);
    await authClient.sendVerificationEmail(
      { email: unverifiedEmail, callbackURL: "/dashboard" },
      {
        onSuccess: () => setNotice(`We sent a new verification link to ${unverifiedEmail}.`),
        onError: (ctx) => setError(ctx.error.message || "Couldn't send the email."),
      },
    );
    setLoading(false);
  };

  // Reset links without a token (or with an expired one) can't work
  if (mode === "reset-password" && (!token || params.error))
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Request a new one.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/{-$locale}/forgot-password">Send a new link</Link>
        </Button>
      </div>
    );

  return (
    <>
      {header}
      {mode === "sign-in" && params.reset && (
        <p className="mb-4 rounded-md border px-3 py-2 text-sm">Password updated. Sign in with your new password.</p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <div className="grid grid-cols-2 gap-3">
            {field("firstName", "First name", "text", { autoComplete: "given-name" })}
            {field("lastName", "Last name", "text", { autoComplete: "family-name" })}
          </div>
        )}
        {mode !== "reset-password" &&
          field("email", "Email", "email", { autoComplete: "email", placeholder: "you@example.com" })}
        {mode !== "forgot-password" &&
          field(
            "password",
            mode === "reset-password" ? "New password" : "Password",
            "password",
            {
              minLength: 8,
              autoComplete: mode === "sign-in" ? "current-password" : "new-password",
            },
            mode === "sign-in" && (
              <Link to="/{-$locale}/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
                Forgot password?
              </Link>
            ),
          )}
        {mode !== "sign-in" && mode !== "forgot-password" && (
          <p className="-mt-2 text-xs text-muted-foreground">At least 8 characters.</p>
        )}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
            {unverifiedEmail && (
              <button type="button" onClick={resend} className="ml-1 font-medium underline">
                Resend email
              </button>
            )}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {cfg.submit}
        </Button>
      </form>
      <p className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? (
          <>
            New to Vyzed?{" "}
            <Link to="/{-$locale}/sign-up" className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </>
        ) : mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link to="/{-$locale}/sign-in" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <Link to="/{-$locale}/sign-in" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        )}
      </p>
    </>
  );
}
