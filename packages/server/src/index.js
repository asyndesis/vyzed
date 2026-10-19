import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import bodyParser from "body-parser";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@vyzed/auth";
import { typeDefs } from "./schema";
import cors from "cors";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";
import { resolvers } from "./resolvers";
import { permissions } from "./permissions";
import dotenv from "dotenv";
import { prisma } from "@vyzed/prisma";
import { enumTypeDefs } from "@vyzed/prisma/enumTypeDefs";

dotenv.config();

const PORT = parseInt(process.env.PORT) || 4000;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "https://vyzed.fly.dev",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// https://www.apollographql.com/docs/apollo-server/api/express-middleware
const schema = makeExecutableSchema({
  typeDefs: [...enumTypeDefs, ...scalarTypeDefs, ...typeDefs],
  resolvers: { ...scalarResolvers, ...resolvers },
});
const schemaWithMiddleware = applyMiddleware(schema, permissions);
const server = new ApolloServer({
  schema: schemaWithMiddleware,
  introspection: process.env.NODE_ENV === "development",
});

await server.start();

app.use(
  "/graphql",
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      // Initialize context with prisma client
      const context = {
        prisma,
        user: null,
        auth: null,
      };

      // Resolve the Better Auth session from the request cookies/headers
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session?.user) return context;

      context.auth = { userId: session.user.id };

      // Fetch the full app user from the database
      context.user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      return context;
    },
  }),
);

app.get("/", (req, res) => {
  res.status(200).send("Server is running!");
});

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
