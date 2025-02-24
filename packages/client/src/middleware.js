import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeOnboarding } from "./lib/complete-onboarding";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const isRootRoute = createRouteMatcher(["/"]);
const isErrorRoute = createRouteMatcher(["/404"]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/(sign-in|sign-up)(.*)",
  "/(sign-in|sign-up)(.*)",
  "/api(.*)",
  "/404(.*)",
  "/test(.*)",
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
      console.error(e);
      if (!isErrorRoute(req)) {
        return NextResponse.redirect(new URL("/404", req.url));
      }
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
