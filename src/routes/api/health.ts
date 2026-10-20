import { createFileRoute } from "@tanstack/react-router";

// Liveness probe for Fly.io; deliberately does not touch the database.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => new Response("ok"),
    },
  },
});
