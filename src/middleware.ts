import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes
  const protectedPaths = [
    "/instrumentpanel",
    "/bokningar",
    "/tillganglighet",
    "/motestyper",
    "/installningar",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath && !isLoggedIn) {
    const signInUrl = new URL("/logga-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/logga-in", "/registrera"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/instrumentpanel", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
