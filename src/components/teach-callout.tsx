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
        <Button
          variant="outline"
          render={<Link to="/sign-in" />}
          nativeButton={false}
        >
          Log in
        </Button>
        <Button render={<Link to="/sign-up" />} nativeButton={false}>
          Become a teacher
        </Button>
      </div>
    </section>
  );
}
