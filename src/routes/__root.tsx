import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { viewerQuery } from "@/lib/session";
import { getLocale } from "@/paraglide/runtime";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    // Every route can read context.viewer (null when signed out)
    beforeLoad: async ({ context }) => ({
      viewer: await context.queryClient.ensureQueryData(viewerQuery),
    }),
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Vyzed" },
        {
          name: "description",
          content:
            "Learn from people near you, or trade lessons skill for skill.",
        },
      ],
      links: [
        { rel: "icon", href: "/favicon.ico" },
        { rel: "stylesheet", href: appCss },
      ],
    }),
    shellComponent: RootDocument,
  },
);

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster position="top-right" />
        </ThemeProvider>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              { name: "Router", render: <TanStackRouterDevtoolsPanel /> },
              { name: "Query", render: <ReactQueryDevtoolsPanel /> },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
