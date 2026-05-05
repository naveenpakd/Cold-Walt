import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes except /admin/login
  if (path.startsWith("/admin") && path !== "/admin/login") {
    // Check for our custom session cookie
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie) {
      // Not authenticated, redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If authenticated or not an admin route, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin/:path*",
};
