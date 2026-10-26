import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { deLocalizeUrl, localizeUrl } from "@/generated/paraglide/runtime";
import { ErrorPage, NotFoundPage } from "@/components/error-page";
import { routeTree } from "@/generated/route-tree";

// Start calls this once per request on the server and once in the browser
export function getRouter() {
  const queryClient = new QueryClient({
    // Data from the server render counts as fresh, so the browser doesn't refetch it right away
    defaultOptions: { queries: { staleTime: 30_000 } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Routes are written without a locale; /de/browse and /es/browse map onto /browse
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    // Let TanStack Query decide freshness for preloads
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorPage,
    defaultNotFoundComponent: NotFoundPage,
  });

  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
