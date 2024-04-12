import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // console.log(req);
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // console.log(req);
        // console.log(token);
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
