import { createFileRoute } from "@tanstack/react-router";

// Fly health check
export const Route = createFileRoute("/api/health")({
  server: { handlers: { GET: () => new Response("ok") } },
});
