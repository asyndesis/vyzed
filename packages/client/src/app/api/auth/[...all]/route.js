import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Resolve auth per request so the build never constructs it
const handler = () => toNextJsHandler(getAuth());
export const GET = (req) => handler().GET(req);
export const POST = (req) => handler().POST(req);
