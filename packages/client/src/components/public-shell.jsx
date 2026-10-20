import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMe } from "@/hooks/use-me";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LanguageMenu, ThemeMenu } from "@/components/preferences";

// Public site navigation. Add About, Pricing, etc. here.
const NAV = [{ title: "Browse teachers", to: "/{-$locale}/browse" }];

// Signed in → Dashboard; signed out → Log in / Sign up. While the session
// resolves, the signed-out buttons hold their space invisibly so nothing shifts.
function AuthActions({ className, onNavigate }) {
  const { signedIn, sessionPending } = useMe();
  if (signedIn)
    return (
      <div className={className}>
        <Button asChild size="sm" onClick={onNavigate}>
          <Link to="/{-$locale}/dashboard">
            Dashboard <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  return (
    <div className={cn(className, sessionPending && "invisible")}>
      <Button asChild size="sm" variant="ghost" onClick={onNavigate}>
        <Link to="/{-$locale}/sign-in">Log in</Link>
      </Button>
      <Button asChild size="sm" onClick={onNavigate}>
        <Link to="/{-$locale}/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

function Header() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 md:px-10">
        <Link to="/{-$locale}" aria-label="Vyzed home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
          onClick={() => setOpen((o) => !o)}
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
                className="rounded-md px-3 py-2 text-sm font-medium"
                activeProps={{ className: "bg-muted" }}
                inactiveProps={{ className: "text-muted-foreground" }}
              >
                {item.title}
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t pt-4">
              <LanguageMenu />
              <ThemeMenu />
              <AuthActions className="ml-auto flex items-center gap-2" onNavigate={() => setOpen(false)} />
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
          <Link to="/{-$locale}/sign-up" className="hover:text-foreground">
            Become a teacher
          </Link>
        </nav>
      </div>
    </footer>
  );
}

// Chrome for signed-out pages: sticky header, content, footer
export function PublicShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Very faint 24px grid behind public content; header, footer and cards stay solid */}
      <div
        className="flex-1"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(128 128 128 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(128 128 128 / 0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}

// Standard content column for public pages (browse, about, …)
export function PublicPage({ className, children }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-8 px-4 py-10 md:px-10 md:py-14", className)}>
      {children}
    </div>
  );
}
