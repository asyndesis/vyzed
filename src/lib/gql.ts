// How this app talks GraphQL.
//
//   const Teachers = graphql(`query Teachers { teachers { id firstName } }`)   // fully typed
//   useSuspenseQuery(gqlQuery(Teachers))                                         // in components
//   context.queryClient.ensureQueryData(gqlQuery(Teachers))                      // in loaders
//   useMutation({ mutationFn: (v) => gqlRequest(UpdateProfile, v) })            // writes
//
// Requests go through a server function that executes the schema in-process: no HTTP hop
// during SSR, and the session cookie comes along automatically. Other apps use /graphql.
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { initGraphQLTada, type TadaDocumentNode } from "gql.tada";
import {
  print,
  type DocumentNode,
  type OperationDefinitionNode,
} from "graphql";
import { z } from "zod";
import type { introspection } from "@/graphql/graphql-env.d";

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: { DateTime: string; ID: string };
}>();

export { readFragment } from "gql.tada";
export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

// A GraphQL result is plain JSON, which tells Start it can be serialized
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const ExecuteInput = z.object({
  query: z.string(),
  variables: z.record(z.string(), z.unknown()).optional(),
});

type GraphQLResponse = {
  data?: { [key: string]: Json } | null;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

const execute = createServerFn({ method: "POST" })
  .validator(ExecuteInput)
  .handler(async ({ data }) => {
    // Imported here so none of it reaches the browser bundle
    const [{ getRequestHeaders }, { yoga }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/server/graphql/yoga"),
    ]);
    // Same Yoga instance as /graphql, called in-process with this request's cookies
    const headers = new Headers(getRequestHeaders() as HeadersInit);
    headers.set("content-type", "application/json");
    headers.delete("content-length");
    const res = await yoga.fetch("http://internal/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query: data.query, variables: data.variables }),
    });
    const result = (await res.json()) as GraphQLResponse;
    const [first] = result.errors ?? [];
    if (first)
      return {
        error: { message: first.message, code: first.extensions?.code },
      };
    return { data: result.data ?? {} };
  });

type Vars<V> =
  V extends Record<string, never> ? [variables?: V] : [variables: V];

export async function gqlRequest<R, V>(
  document: TadaDocumentNode<R, V>,
  ...[variables]: Vars<V>
): Promise<R> {
  const res = await execute({
    data: {
      query: print(document),
      variables: variables as Record<string, unknown>,
    },
  });
  if ("error" in res && res.error)
    throw new GraphQLRequestError(res.error.message, res.error.code);
  return res.data as R;
}

const operationName = (document: DocumentNode) =>
  (
    document.definitions.find((d) => d.kind === "OperationDefinition") as
      | OperationDefinitionNode
      | undefined
  )?.name?.value ?? "anonymous";

// Query key is [operationName, variables], so invalidateQueries({ queryKey: ['MyLessons'] }) works
export function gqlQuery<R, V>(
  document: TadaDocumentNode<R, V>,
  ...[variables]: Vars<V>
) {
  return queryOptions({
    queryKey: [operationName(document), variables ?? {}] as const,
    queryFn: () => gqlRequest(document, ...([variables] as Vars<V>)),
  });
}
