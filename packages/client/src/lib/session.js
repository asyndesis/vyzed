import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Server-side helper: returns the Better Auth session (or null)
export const getSession = async () =>
  auth.api.getSession({ headers: await headers() });
