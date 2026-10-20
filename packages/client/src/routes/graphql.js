import { createFileRoute } from "@tanstack/react-router";

// The GraphQL server runs in the same container. Proxy it so the browser talks
// to one origin (no CORS, auth cookies just work).
const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://localhost:4000";

const proxy = async ({ request }) => {
  const { pathname, search } = new URL(request.url);
  const res = await fetch(API_INTERNAL_URL + pathname + search, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    duplex: "half",
    redirect: "manual",
  });
  // fetch already decoded the body
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new Response(res.body, { status: res.status, headers });
};

export const Route = createFileRoute("/graphql")({
  server: { handlers: { GET: proxy, POST: proxy, OPTIONS: proxy } },
});
