import { MobileMenuToggle } from "./components/mobile-menu-toggle";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";

export default function HomeLayout({ children }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-background to-background/90">
        {children}
      </main>
    </>
  );
}

function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
              Vyzed
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {/* <NavLinks /> */}
            <div className="flex items-center gap-4">
              {/* <AuthButtons /> */}
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <MobileMenuToggle>
              {/* <NavLinks mobile /> */}
              <div className="flex gap-2 pt-2">
                {/* <AuthButtons mobile /> */}
              </div>
            </MobileMenuToggle>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLinks({ mobile = false }) {
  const linkClasses = mobile
    ? "text-sm font-medium hover:text-primary transition-colors py-2 px-4 rounded-md hover:bg-muted"
    : "text-sm font-medium hover:text-primary transition-colors";

  return (
    <nav
      className={mobile ? "flex flex-col space-y-4" : "flex items-center gap-6"}
    >
      <a href="#" className={linkClasses}>
        Home
      </a>
      <a href="#" className={linkClasses}>
        For Educators
      </a>
      <a href="#" className={linkClasses}>
        For Learners
      </a>
      <a href="#" className={linkClasses}>
        Pricing
      </a>
    </nav>
  );
}

function AuthButtons({ mobile = false }) {
  return (
    <>
      <Button
        asChild
        variant="secondary"
        size="sm"
        className={mobile ? "w-1/2" : ""}
      >
        <Link href="/sign-in">Log in</Link>
      </Button>
      <Button asChild size="sm" className={mobile ? "w-1/2" : ""}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </>
  );
}
