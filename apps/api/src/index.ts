import { serve } from "@hono/node-server";
import { useMongoClient } from "@vyzed/db";
import { app } from "./app";
import { env } from "./env";
import { mongoClient } from "./lib/mongo";

await mongoClient.connect();
useMongoClient(mongoClient);

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.info(`API listening on http://localhost:${info.port}`);
});

const shutdown = () => {
  server.close();
  void mongoClient.close().finally(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
