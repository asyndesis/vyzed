import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getAuth } from "@vyzed/auth";

// Validates the Better Auth session cookie on the server
export const hasSession = createServerFn().handler(async () => {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  return !!session;
});
