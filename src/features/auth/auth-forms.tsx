import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/auth-client";
import { viewerQuery } from "@/features/auth/session";

// Building blocks -------------------------------------------------------------

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({
  name,
  label,
  aside,
  ...input
}: React.ComponentProps<typeof Input> & {
  name: string;
  label: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="relative space-y-2">
      <div className={aside ? "flex h-5 items-center" : undefined}>
        <Label htmlFor={name}>{label}</Label>
      </div>
      <Input id={name} name={name} required {...input} />
      {/* After the input in the DOM so Tab visits it next, but shown beside the label */}
      {aside && (
        <div className="absolute right-0 top-0 flex h-5 items-center">
          {aside}
        </div>
      )}
    </div>
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {children}
    </div>
  );
}

function Submit({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

const footerLink = "font-medium text-foreground hover:underline";

// Replaces a form once an email has been sent
function CheckEmail({ message }: { message: string }) {
  return (
    <div className="space-y-4">
      <div className="flex size-10 items-center justify-center rounded-lg border">
        <MailCheck className="size-5" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        render={<Link to="/sign-in" />}
        nativeButton={false}
      >
        Back to sign in
      </Button>
    </div>
  );
}

const values = (e: React.FormEvent<HTMLFormElement>) =>
  Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

// Forms -------------------------------------------------------------------------

// Only same-site paths, never //evil.com
const safeRedirect = (r?: string) =>
  r && /^\/(?!\/)/.test(r) ? r : "/dashboard";

export function SignInForm({
  redirect,
  passwordReset,
}: {
  redirect?: string;
  passwordReset?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState("");
  const [sent, setSent] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = values(e);
    setPending(true);
    setError("");
    setUnverified("");
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setPending(false);
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverified(email);
        return setError("Please verify your email before signing in.");
      }
      return setError(
        error.message ?? "Something went wrong. Please try again.",
      );
    }
    await queryClient.resetQueries({ queryKey: viewerQuery.queryKey });
    await router.navigate({ href: safeRedirect(redirect), replace: true });
  };

  const resend = async () => {
    const { error } = await authClient.sendVerificationEmail({
      email: unverified,
      callbackURL: "/dashboard",
    });
    if (error) setError(error.message ?? "Couldn't send the email.");
    else setSent(`We sent a new verification link to ${unverified}.`);
  };

  if (sent) return <CheckEmail message={sent} />;

  return (
    <>
      <Header
        title="Welcome back"
        description="Sign in to your Vyzed account."
      />
      {passwordReset && (
        <p className="mb-4 rounded-md border px-3 py-2 text-sm">
          Password updated. Sign in with your new password.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          aside={
            <Link
              to="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          }
        />
        {error && (
          <ErrorNote>
            {error}
            {unverified && (
              <button
                type="button"
                onClick={resend}
                className="ml-1 font-medium underline"
              >
                Resend email
              </button>
            )}
          </ErrorNote>
        )}
        <Submit pending={pending}>Sign in</Submit>
      </form>
      <Footer>
        New to Vyzed?{" "}
        <Link to="/sign-up" className={footerLink}>
          Create an account
        </Link>
      </Footer>
    </>
  );
}

export function SignUpForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = values(e);
    setPending(true);
    setError("");
    const { error } = await authClient.signUp.email({
      email: f.email,
      password: f.password,
      name: `${f.firstName} ${f.lastName}`.trim(),
      firstName: f.firstName,
      lastName: f.lastName,
      callbackURL: "/dashboard",
    });
    setPending(false);
    if (error)
      setError(error.message ?? "Something went wrong. Please try again.");
    else setSent("Check your email for a link to verify your account.");
  };

  if (sent) return <CheckEmail message={sent} />;

  return (
    <>
      <Header
        title="Create your account"
        description="Learn, teach, or swap skills with people near you."
      />
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            name="firstName"
            label="First name"
            autoComplete="given-name"
          />
          <Field name="lastName" label="Last name" autoComplete="family-name" />
        </div>
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          name="password"
          label="Password"
          type="password"
          minLength={8}
          autoComplete="new-password"
        />
        <p className="-mt-2 text-xs text-muted-foreground">
          At least 8 characters.
        </p>
        {error && <ErrorNote>{error}</ErrorNote>}
        <Submit pending={pending}>Sign up</Submit>
      </form>
      <Footer>
        Already have an account?{" "}
        <Link to="/sign-in" className={footerLink}>
          Sign in
        </Link>
      </Footer>
    </>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const { error } = await authClient.requestPasswordReset({
      email: values(e).email,
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (error)
      setError(error.message ?? "Something went wrong. Please try again.");
    else setSent(true);
  };

  if (sent)
    return <CheckEmail message="If that email exists, a link is on its way." />;

  return (
    <>
      <Header
        title="Forgot password"
        description="Enter your email and we'll send you a reset link."
      />
      <form onSubmit={submit} className="space-y-4">
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Submit pending={pending}>Send reset link</Submit>
      </form>
      <Footer>
        <Link to="/sign-in" className={footerLink}>
          Back to sign in
        </Link>
      </Footer>
    </>
  );
}

export function ResetPasswordForm({
  token,
  expired,
}: {
  token?: string;
  expired?: boolean;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Links without a token (or with an expired one) can't work
  if (!token || expired)
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Request a new
            one.
          </p>
        </div>
        <Button
          className="w-full"
          render={<Link to="/forgot-password" />}
          nativeButton={false}
        >
          Send a new link
        </Button>
      </div>
    );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: values(e).password,
      token,
    });
    setPending(false);
    if (error)
      setError(error.message ?? "Something went wrong. Please try again.");
    else navigate({ to: "/sign-in", search: { reset: true }, replace: true });
  };

  return (
    <>
      <Header
        title="Reset password"
        description="Choose a new password for your account."
      />
      <form onSubmit={submit} className="space-y-4">
        <Field
          name="password"
          label="New password"
          type="password"
          minLength={8}
          autoComplete="new-password"
        />
        <p className="-mt-2 text-xs text-muted-foreground">
          At least 8 characters.
        </p>
        {error && <ErrorNote>{error}</ErrorNote>}
        <Submit pending={pending}>Reset password</Submit>
      </form>
    </>
  );
}
