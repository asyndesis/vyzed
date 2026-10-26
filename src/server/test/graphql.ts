import { graphql } from "graphql";
import type { Viewer } from "@/features/auth/policies";
import { schema } from "@/server/graphql/schema";

// Runs an operation against the real schema as `viewer` (anonymous when omitted)
export async function gql(
  source: string,
  options: { viewer?: Viewer; variables?: Record<string, unknown> } = {},
) {
  const result = await graphql({
    schema,
    source,
    variableValues: options.variables,
    contextValue: { viewer: options.viewer ?? null },
  });
  return {
    data: result.data as Record<string, any> | null | undefined,
    message: result.errors?.[0]?.message,
    code: result.errors?.[0]?.extensions?.code,
  };
}

export const asUser = (id: string): Viewer => ({ id, role: "user" });
