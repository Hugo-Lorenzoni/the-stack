import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // crypto.randomUUID() uses the Web Crypto API, available as a global in
    // both the Node.js (18+) and Edge runtimes — no import needed.
    const requestId =
      req.headers.get("x-request-id") ?? crypto.randomUUID();

    // Clone request headers and inject x-request-id so downstream
    // handlers and server components can read it via headers() or req.headers.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    // Also set on response so the client can see the correlation ID.
    response.headers.set("x-request-id", requestId);
    return response;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (
          req.nextUrl.pathname.startsWith("/admin") ||
          req.nextUrl.pathname.startsWith("/api/admin")
        ) {
          return token?.role === "ADMIN";
        }
        if (
          req.nextUrl.pathname.startsWith("/fpmsevents") ||
          req.nextUrl.pathname.startsWith("/videos") ||
          req.nextUrl.pathname.startsWith("/api/image/BAPTISE")
        ) {
          return token?.role === "BAPTISE" || token?.role === "ADMIN";
        }
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/fpmsevents/:path*",
    "/api/image/BAPTISE/:path*",
    "/videos/:path*",
    "/events/:path*",
    "/api/image/OUVERT/:path*",
    "/search/:path*",
    "/api/search/:path*",
  ],
};
