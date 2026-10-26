import SchemaBuilder from "@pothos/core";
import DrizzlePlugin from "@pothos/plugin-drizzle";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import { getTableConfig } from "drizzle-orm/pg-core";
import { GraphQLError } from "graphql";
import type { Viewer } from "@/features/auth/policies";
import { db } from "../db";
import { relations } from "../db/relations";

export type Context = { viewer: Viewer | null };

export const builder = new SchemaBuilder<{
  Context: Context;
  DrizzleRelations: typeof relations;
  AuthScopes: { loggedIn: boolean; admin: boolean };
  Scalars: { DateTime: { Input: Date; Output: Date | string } };
  DefaultFieldNullability: false;
}>({
  plugins: [ScopeAuthPlugin, DrizzlePlugin],
  defaultFieldNullability: false,
  drizzle: { client: db, getTableConfig, relations },
  scopeAuth: {
    authScopes: (ctx) => ({
      loggedIn: !!ctx.viewer,
      admin: ctx.viewer?.role === "admin",
    }),
    unauthorizedError: () =>
      new GraphQLError("Not authorized", { extensions: { code: "FORBIDDEN" } }),
  },
});

builder.scalarType("DateTime", {
  serialize: (d) => (d instanceof Date ? d.toISOString() : d),
  parseValue: (v) => {
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) throw new GraphQLError("Invalid DateTime");
    return d;
  },
});

builder.queryType({});
builder.mutationType({});

// Throw inside resolvers when a record-level policy says no
export function forbid(): never {
  throw new GraphQLError("Not authorized", {
    extensions: { code: "FORBIDDEN" },
  });
}

export function notFound(what: string): never {
  throw new GraphQLError(`${what} not found`, {
    extensions: { code: "NOT_FOUND" },
  });
}

// Narrows ctx.viewer for fields guarded by authScopes: { loggedIn: true }
export function viewerOf(ctx: Context): Viewer {
  return ctx.viewer ?? forbid();
}
