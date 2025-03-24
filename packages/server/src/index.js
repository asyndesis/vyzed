import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import bodyParser from "body-parser";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { clerkMiddleware } from "@clerk/express";
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
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(clerkMiddleware());

// https://www.apollographql.com/docs/apollo-server/api/express-middleware
const schema = makeExecutableSchema({
  typeDefs: [...scalarTypeDefs, ...typeDefs],
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

      // Check if they are authed. If so, attach the user to the context
      const clerkUserId = req.auth?.userId;
      if (!clerkUserId) return context;

      // Could store whole auth object here, but lets be conscise
      context.auth = { userId: clerkUserId };

      // Fetch user from database
      const dbUser = await prisma.user.findUnique({
        where: { authId: clerkUserId },
      });

      // If we have a dbUser, add it to the context
      if (dbUser) {
        context.user = { ...dbUser, authId: clerkUserId };
      }

      return context;
    },
  })
);

app.get("/", (req, res) => {
  res.status(200).send("Server is running!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
});
