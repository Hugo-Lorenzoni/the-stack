import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // crypto.randomUUID() uses the Web Crypto API, available as a global in
    // both the Node.js (18+) and Edge runtimes — no import needed.
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

    // Clone request headers and inject x-request-id so downstream
    // handlers and server components can read it via headers() or req.headers.
    // Preserve x-flow-id if the caller supplied one for cross-request correlation.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-request-id", requestId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    // Also set on response so the client can see the correlation IDs.
    response.headers.set("x-request-id", requestId);
    const flowId = req.headers.get("x-flow-id");
    if (flowId) response.headers.set("x-flow-id", flowId);
    return response;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;
        const isAdminPath =
          pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
        const isBaptisePath =
          pathname.startsWith("/fpmsevents") ||
          pathname.startsWith("/videos") ||
          pathname.startsWith("/api/image/BAPTISE");
        const isAuthenticatedPath =
          pathname.startsWith("/events") ||
          pathname.startsWith("/api/image/OUVERT") ||
          pathname.startsWith("/search") ||
          pathname.startsWith("/api/search");

        if (!isAdminPath && !isBaptisePath && !isAuthenticatedPath) {
          return true;
        }

        if (isAdminPath) {
          return token?.role === "ADMIN";
        }

        if (isBaptisePath) {
          return token?.role === "BAPTISE" || token?.role === "ADMIN";
        }

        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
