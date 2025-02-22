import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeOnboarding } from "./lib/complete-onboarding";
// import { completeOnboarding } from "@/services/completeOnboarding";

const isRootRoute = createRouteMatcher(["/"]);
const isErrorRoute = createRouteMatcher(["/404"]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/404(.*)",
  "/test(.*)",
]);

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
        clerkUserId: userId,
        token,
      });
    } catch (e) {
      console.error(e);
      if (!isErrorRoute(req)) {
        return NextResponse.redirect(new URL("/404", req.url));
      }
    }

    // If just landing in the app, take them to dashboard
    if (isRootRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
