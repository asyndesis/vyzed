import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
  /^\/api(\/|$)/,
  /^\/(?:(?:en|de|es)\/?)?$/,
  /^\/(?:(?:en|de|es)\/)?(sign-in|sign-up|forgot-password|reset-password)(\/|$)/,
  /^\/(?:(?:en|de|es)\/)?dashboard\/teachers(\/|$)/,
];

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  // /graphql is rewritten to the API server, which does its own auth
  if (pathname.startsWith("/api") || pathname === "/graphql") return NextResponse.next();

  const isPublic = PUBLIC_PATHS.some((re) => re.test(pathname));

  // Optimistic check only (cookie presence). Real validation happens in
  // the server on every GraphQL request and in getSession() on the server.
  if (!isPublic && !getSessionCookie(req)) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
