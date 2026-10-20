import { Link } from "@/lib/navigation";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";

// Signed-out nudge at the bottom of public pages
export function TeachCallout() {
  const { signedIn, sessionPending } = useMe();
  if (signedIn) return null;
  return (
    <section
      className={`flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between ${sessionPending ? "invisible" : ""}`}
    >
      <div>
        <h2 className="font-semibold">Got something to teach?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a free profile, set your rate or open yourself to swaps.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/sign-in">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Become a teacher</Link>
        </Button>
      </div>
    </section>
  );
}
