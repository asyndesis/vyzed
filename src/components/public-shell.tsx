import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LanguageMenu, ThemeMenu } from "@/components/preferences";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Public site navigation. Add About, Pricing, etc. here.
const NAV = [{ title: "Browse teachers", to: "/browse" }] as const;

// Known from the server render, so nothing shifts once the page loads
function AuthActions({ className }: { className?: string }) {
  const { viewer } = useRouteContext({ from: "__root__" });
  if (viewer)
    return (
      <div className={className}>
        <Button
          size="sm"
          render={<Link to="/dashboard" />}
          nativeButton={false}
        >
          Dashboard <ArrowRight />
        </Button>
      </div>
    );
  return (
    <div className={className}>
      <Button
        size="sm"
        variant="ghost"
        render={<Link to="/sign-in" />}
        nativeButton={false}
      >
        Log in
      </Button>
      <Button size="sm" render={<Link to="/sign-up" />} nativeButton={false}>
        Sign up
      </Button>
    </div>
  );
}

function Header() {
  const pathname = useLocation({ select: (l) => l.pathname });
  // Remember which page the menu was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 md:px-10">
        <Link to="/" aria-label="Vyzed home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-1 md:flex">
          <LanguageMenu />
          <ThemeMenu />
          <AuthActions className="ml-2 flex items-center gap-2" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setOpenOn(open ? null : pathname)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {item.title}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t pt-4">
              <LanguageMenu />
              <ThemeMenu />
              <AuthActions className="ml-auto flex items-center gap-2" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
        <span>© Vyzed</span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="hover:text-foreground">
              {item.title}
            </Link>
          ))}
          <Link to="/sign-up" className="hover:text-foreground">
            Become a teacher
          </Link>
        </nav>
      </div>
    </footer>
  );
}

// Chrome for signed-out pages: sticky header, faint grid behind content, footer
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-grid">{children}</div>
      <Footer />
    </div>
  );
}

// Standard content column for public pages
export function PublicPage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:px-10 md:py-14",
        className,
      )}
    >
      {children}
    </div>
  );
}
