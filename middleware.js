// Filename: middleware.js

import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // This array lists all the routes that are accessible to the public.
  // Any route not in this list will require authentication.
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/create-order",
  ],
});

export const config = {
  // This configures the middleware to run on all routes except for static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};