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
          req.nextUrl.pathname.startsWith("/api/admin") ||
          req.nextUrl.pathname.startsWith("/admin")
        ) {
          return token?.role === "ADMIN";
        } else if (
          req.nextUrl.pathname.startsWith("/fpmsevents") ||
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
    "/api/admin/:path*",
    "/admin/:path*",
    "/fpmsevents/:path*",
    "/videos/:path*",
    "/events/:path*",
    "/api/search/:path*",
    "/search/:path*",
  ],
};
