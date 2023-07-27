import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // `/admin` requires admin role
      console.log(token?.role);
      console.log(req.nextUrl.pathname);

      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }
      if (req.nextUrl.pathname.startsWith("/fpmsevents")) {
        return token?.role === "BAPTISE" || token?.role === "ADMIN";
      }
      // `/events/:path*` only requires the user to be logged in
      return !!token;
    },
    //authorized: ({ req, token }) => token?.role === "admin",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/fpmsevents/:path*", "/events/:path*"],
};
