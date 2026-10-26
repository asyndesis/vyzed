import { Link, useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Signed-out nudge at the bottom of public pages (known at SSR, so it never pops)
export function TeachCallout() {
  const { viewer } = useRouteContext({ from: "__root__" });
  if (viewer) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Got something to teach?</CardTitle>
        <CardDescription>
          Create a free profile, set your rate or open yourself to swaps.
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
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
      </CardFooter>
    </Card>
  );
}
