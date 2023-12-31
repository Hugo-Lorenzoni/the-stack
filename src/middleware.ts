import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith("/BAPTISE") ||
      req.nextUrl.pathname.startsWith("/OUVERT") ||
      req.nextUrl.pathname.startsWith("/AUTRE") ||
      req.nextUrl.pathname.startsWith("/SPONSORS")
    ) {
      // console.log(req.nextUrl.pathname);
      const url = req.nextUrl.clone();
      url.pathname = `/api/images${req.nextUrl.pathname}`;
      // console.log(url.pathname);

      return NextResponse.rewrite(url);
    }

    // console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // `/admin` requires admin role
        // console.log(token?.role);
        // console.log(req.nextUrl.pathname);

        if (
          req.nextUrl.pathname.startsWith("/admin") ||
          req.nextUrl.pathname.startsWith("/api/admin")
        ) {
          return token?.role === "ADMIN";
        }
        if (
          req.nextUrl.pathname.startsWith("/fpmsevents") ||
          req.nextUrl.pathname.startsWith("/api/fpmsevents") ||
          req.nextUrl.pathname.startsWith("/BAPTISE") ||
          req.nextUrl.pathname.startsWith("/videos")
        ) {
          return token?.role === "BAPTISE" || token?.role === "ADMIN";
        }
        // `/events/:path*` only requires the user to be logged in
        return !!token;
      },
      //authorized: ({ req, token }) => token?.role === "admin",
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/fpmsevents/:path*",
    "/events/:path*",
    "/api/admin/:path*",
    "/api/fpmsevents/:path*",
    "/OUVERT/:path*",
    "/BAPTISE/:path*",
    "/AUTRE/:path*",
    "/SPONSORS/:path*",
    "/search/:path*",
    "/api/search/:path*",
    "/videos/:path*",
  ],
};
