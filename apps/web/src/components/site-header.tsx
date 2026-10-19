import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@vyzed/ui/components/button";
import { authClient } from "~/lib/auth-client";
import { meQuery } from "~/lib/queries";

export function SiteHeader() {
  const { data: me } = useQuery(meQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
    await navigate({ to: "/" });
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="text-lg font-bold tracking-tight">
          vyzed
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/teachers" className="text-muted-foreground hover:text-foreground">
            Find a teacher
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {me ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => void signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
