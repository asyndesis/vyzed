import { createFileRoute } from "@tanstack/react-router";
import { API_URL } from "~/lib/api";

/** Forwards /api/* to the Hono API so the browser only ever talks to the web app's origin. */
export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { pathname, search } = new URL(request.url);
        const headers = new Headers(request.headers);
        headers.delete("host");
        // fetch() decompresses bodies, so ask for none rather than forward a stale encoding.
        headers.delete("accept-encoding");

        // Node needs `duplex` to stream a request body; the DOM RequestInit type doesn't know it.
        const res = await fetch(new URL(pathname + search, API_URL), {
          method: request.method,
          headers,
          body: request.body,
          duplex: "half",
          redirect: "manual",
        } as RequestInit);
        return new Response(res.body, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      },
    },
  },
});
