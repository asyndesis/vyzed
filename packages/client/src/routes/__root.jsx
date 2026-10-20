import { HeadContent, Outlet, Scripts, createRootRoute, redirect } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ErrorPage } from "@/components/error-page";
import { RootError } from "@/components/root-error";
import { detectLocale, isLocale } from "@/lib/locale";
import { useLocale } from "@/lib/navigation";
import appCss from "@/styles/globals.css?url";

export const Route = createRootRoute({
  // Every page lives under /:locale. Send bare paths (/, /dashboard, links from
  // emails) to the visitor's language.
  beforeLoad: async ({ location }) => {
    if (isLocale(location.pathname.split("/")[1])) return;
    const path = location.pathname === "/" ? "" : location.pathname;
    throw redirect({ href: `/${await detectLocale()}${path}${location.searchStr}` });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vyzed" },
      {
        name: "description",
        content: "Learn from people near you, or trade lessons skill for skill.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
  errorComponent: RootError,
  notFoundComponent: () => (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      iconName="FileQuestion"
      actionText="Back to Home"
      actionHref="/"
    />
  ),
});

function RootComponent() {
  return (
    <html lang={useLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={0}>
            <Outlet />
          </TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
