import type { Viewer } from "@/domain/policies";
import { auth } from "./auth";

// Who is calling: session cookie (this app), Authorization: Bearer <token>, or x-api-key.
// Better Auth's bearer and api-key plugins turn the last two into a session too.
export async function getViewer(headers: Headers): Promise<Viewer | null> {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  return {
    id: session.user.id,
    role: session.user.role === "admin" ? "admin" : "user",
  };
}
