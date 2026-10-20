import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export function ErrorPage({
  statusCode = 500,
  title = "Something went wrong",
  description = "We encountered an unexpected error.",
  iconName = "CircleAlert",
  actionText = "Back to Home",
  actionTo = "/{-$locale}",
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg overflow-hidden border border-border/40">
        <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon iconName={iconName} className="h-14 w-14 text-primary" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-5xl font-bold tracking-tight text-muted-foreground">
                {statusCode}
              </h1>
              <h2 className="text-2xl font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-muted-foreground max-w-sm">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/30 border-t border-border/40">
          <div className="flex justify-center items-center gap-4">
            <Link
              to={actionTo}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            >
              {actionText}
            </Link>
            <SignOutButton>
              <Button variant="outline">Log out</Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
