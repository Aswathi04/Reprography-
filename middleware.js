// Filename: middleware.js

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/create-order",
];

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl ? req.nextUrl.pathname : new URL(req.url).pathname;

  // Allow public routes without redirecting to sign-in
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get middleware auth object
  const authObj = await auth();

  // If signed in, continue
  if (authObj && (authObj.sessionId || authObj.userId)) {
    return NextResponse.next();
  }

  // Otherwise redirect to sign-in using Clerk helper if available
  if (authObj && typeof authObj.redirectToSignIn === "function") {
    return authObj.redirectToSignIn({ returnBackUrl: req.url });
  }

  // Fallback: redirect to local sign-in page
  return NextResponse.redirect(new URL("/sign-in", req.url));
});

export const config = {
  // This configures the middleware to run on all routes except for static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};