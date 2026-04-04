import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const requestId =
      req.headers.get("x-request-id") ?? crypto.randomUUID();
    const response = NextResponse.next();
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
