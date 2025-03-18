import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeOnboarding } from "./lib/complete-onboarding";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const isRootRoute = createRouteMatcher(["/"]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/(sign-in|sign-up)(.*)",
  "/api(.*)",
]);

const intlMiddleware = createMiddleware(routing);
export default clerkMiddleware(async (auth, req) => {
  const clerkAuth = await auth();
  const { userId, redirectToSignIn, getToken } = clerkAuth;

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    // Make sure user exists in our system, if not, let's onboard them
    const token = await getToken();

    try {
      await completeOnboarding({
        authId: userId,
        token,
      });
    } catch (e) {
      console.error("Onboarding error:", e);
      return NextResponse.next();
    }

    // if (isRootRoute(req)) {
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
