import { createFileRoute } from "@tanstack/react-router";
import { yoga } from "@/server/graphql/yoga";

// Public GraphQL API (and GraphiQL in dev). This app's own pages use lib/gql.ts.
const handle = async ({ request }: { request: Request }) => {
  const res = await yoga.handleRequest(request, {});
  // Yoga answers with its own Response class on Node; Start only accepts the native one
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};

export const Route = createFileRoute("/graphql")({
  server: { handlers: { GET: handle, POST: handle, OPTIONS: handle } },
});
