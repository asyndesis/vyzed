import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@vyzed/auth";

// Better Auth owns everything under /api/auth. Resolved per request so the
// build never constructs it.
const handle = ({ request }) => getAuth().handler(request);

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});
