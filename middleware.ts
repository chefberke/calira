import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define public routes that don't require authentication
  const publicRoutes = ["/sign-in", "/sign-up"];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Define auth routes (sign-in, sign-up)
  const isAuthRoute = publicRoutes.includes(nextUrl.pathname);

  // If user is on auth route and already logged in, redirect to board
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/board", nextUrl));
  }

  // If user is not logged in and trying to access protected route, redirect to sign-in
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
