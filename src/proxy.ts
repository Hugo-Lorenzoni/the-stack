import { withAuth } from "next-auth/middleware";

export default withAuth(function proxy(req) {}, {
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
});

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
