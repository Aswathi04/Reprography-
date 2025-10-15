// Filename: middleware.js

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/create-order",
  "/orders", // Added to allow unauthenticated access
  "/order", // Added to allow unauthenticated access
];

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl ? req.nextUrl.pathname : new URL(req.url).pathname;

  // Allow Clerk's catch-all routes for sign-in/sign-up and their sub-paths
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.next();
  }

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

  // For protected routes, redirect to sign-in
  return NextResponse.redirect(new URL("/sign-in", req.url));
});

export const config = {
  // This configures the middleware to run on all routes except for static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};