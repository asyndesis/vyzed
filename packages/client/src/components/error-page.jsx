import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ErrorPage({ icon: Icon, title, description }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center">
        <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-6">
          <Link to="/{-$locale}">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
