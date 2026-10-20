import { HeadContent, Scripts, createRootRoute, useParams } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { CircleAlert, FileQuestion } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ErrorPage } from "@/components/error-page";
import { defaultLocale } from "@/lib/locale";
import appCss from "@/styles/globals.css?url";

export const Route = createRootRoute({
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
  // The document wraps every page, including the error and 404 pages below
  shellComponent: RootDocument,
  errorComponent: ({ error }) => {
    console.error(error);
    return (
      <ErrorPage
        icon={CircleAlert}
        title="Something went wrong"
        description="We're sorry, something broke on our end. Try again in a moment."
      />
    );
  },
  notFoundComponent: () => (
    <ErrorPage
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
    />
  ),
});

function RootDocument({ children }) {
  const { locale = defaultLocale } = useParams({ strict: false });
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
