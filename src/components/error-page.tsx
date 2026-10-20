import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { CircleAlert, FileQuestion, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function Message({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center">
        <Icon className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button className="mt-6" render={<Link to="/" />} nativeButton={false}>
          Back to home
        </Button>
      </div>
    </main>
  );
}

export function ErrorPage({ error }: ErrorComponentProps) {
  console.error(error);
  return (
    <Message
      icon={CircleAlert}
      title="Something went wrong"
      description="We're sorry, something broke on our end. Try again in a moment."
    />
  );
}

export function NotFoundPage() {
  return (
    <Message
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
