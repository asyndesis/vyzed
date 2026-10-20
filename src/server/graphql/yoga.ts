import { createYoga } from "graphql-yoga";
import { env } from "@/env";
import { getViewer } from "../viewer";
import type { Context } from "./builder";
import { schema } from "./schema";

const dev = process.env.NODE_ENV !== "production";

export const yoga = createYoga<object, Context>({
  schema,
  graphqlEndpoint: "/graphql",
  context: async ({ request }) => ({
    viewer: await getViewer(request.headers),
  }),
  // Same-origin requests need no CORS; list other browser origins in CORS_ORIGINS
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  graphiql: dev,
  landingPage: false,
  maskedErrors: !dev,
});
