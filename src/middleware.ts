import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // console.log(req);
    if (
      req.nextUrl.pathname.startsWith("/BAPTISE") ||
      req.nextUrl.pathname.startsWith("/OUVERT") ||
      req.nextUrl.pathname.startsWith("/AUTRE") ||
      req.nextUrl.pathname.startsWith("/SPONSORS")
    ) {
      const url = req.nextUrl.clone();
      const newUrl = new URL(
        `${process.env.MINIO_BUCKET}${url.pathname}`,
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      );
      return NextResponse.redirect(newUrl);
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // console.log(req);
        // console.log(token);
        if (
          req.nextUrl.pathname.startsWith("/api/admin") ||
          req.nextUrl.pathname.startsWith("/admin")
        ) {
          return token?.role === "ADMIN";
        } else if (
          req.nextUrl.pathname.startsWith("/BAPTISE") ||
          req.nextUrl.pathname.startsWith("/fpmsevents") ||
          req.nextUrl.pathname.startsWith("/videos")
        ) {
          return token?.role === "BAPTISE" || token?.role === "ADMIN";
        } else if (
          req.nextUrl.pathname.startsWith("/OUVERT") ||
          req.nextUrl.pathname.startsWith("/events") ||
          req.nextUrl.pathname.startsWith("/search") ||
          req.nextUrl.pathname.startsWith("/api/search")
        ) {
          // `/events/:path*` only requires the user to be logged in
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/OUVERT/:path*",
    "/BAPTISE/:path*",
    "/AUTRE/:path*",
    "/SPONSORS/:path*",
    "/api/admin/:path*",
    "/admin/:path*",
    "/fpmsevents/:path*",
    "/videos/:path*",
    "/events/:path*",
    "/api/search/:path*",
    "/search/:path*",
  ],
};
