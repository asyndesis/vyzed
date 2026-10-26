import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Viewer } from "@/lib/policies";

// Who is signed in, read from the session cookie on the server
const getViewerFn = createServerFn().handler(
  async (): Promise<Viewer | null> => {
    const [{ getRequestHeaders }, { getViewer }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/server/viewer"),
    ]);
    return getViewer(new Headers(getRequestHeaders() as HeadersInit));
  },
);

// Cached so client-side navigations don't ask the server every time.
// Sign-in/out call queryClient.resetQueries(viewerQuery) to refresh it.
export const viewerQuery = queryOptions({
  queryKey: ["viewer"],
  queryFn: () => getViewerFn(),
  staleTime: 5 * 60_000,
});
