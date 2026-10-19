import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

// Server-side helper: returns the Better Auth session (or null)
export const getSession = async () =>
  getAuth().api.getSession({ headers: await headers() });
