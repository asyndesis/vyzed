import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

// Signed-out nudge at the bottom of public pages (known at SSR, so it never pops)
export function TeachCallout() {
  const { viewer } = useRouteContext({ from: "__root__" });
  if (viewer) return null;
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold">Got something to teach?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free profile, set your rate or open yourself to swaps.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link to="/sign-in">Log in</Link>
        </Button>
        <Button asChild>
          <Link to="/sign-up">Become a teacher</Link>
        </Button>
      </div>
    </section>
  );
}
