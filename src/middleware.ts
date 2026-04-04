import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Clone request headers and inject IDs so downstream handlers and server
    // components can read them via headers() or req.headers.
    const requestHeaders = new Headers(req.headers);

    // crypto.randomUUID() uses the Web Crypto API, available as a global in
    // both the Node.js (18+) and Edge runtimes.
    const requestId = requestHeaders.get("x-request-id") ?? crypto.randomUUID();
    const existingFlowId =
      req.cookies.get("flow_id")?.value ?? requestHeaders.get("x-flow-id");
    const flowId = existingFlowId ?? crypto.randomUUID();

    requestHeaders.set("x-request-id", requestId);
    requestHeaders.set("x-flow-id", flowId);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Also mirror IDs on the response so the client can correlate requests.
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-flow-id", flowId);

    if (!existingFlowId) {
      response.cookies.set("flow_id", flowId, {
        httpOnly: true,
        sameSite: "lax",
        secure: req.nextUrl.protocol === "https:",
        path: "/",
      });
    }

    return response;
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;

        const requestId =
          req.headers.get("x-request-id") ?? crypto.randomUUID();
        const flowId =
          req.headers.get("x-flow-id") ??
          req.cookies.get("flow_id")?.value ??
          crypto.randomUUID();

        const logAccessDenied = (
          reason:
            | "admin_role_required"
            | "baptise_role_required"
            | "auth_required",
        ) => {
          const event = {
            event: "auth.access_denied",
            request_id: requestId,
            flow_id: flowId,
            method: req.method,
            path: pathname,
            reason,
            authenticated: !!token,
            user_role: token?.role ?? null,
            timestamp: new Date().toISOString(),
          };
          console.warn(JSON.stringify(event));
        };

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
          const allowed = token?.role === "ADMIN";
          if (!allowed) logAccessDenied("admin_role_required");
          return allowed;
        }

        if (isBaptisePath) {
          const allowed = token?.role === "BAPTISE" || token?.role === "ADMIN";
          if (!allowed) logAccessDenied("baptise_role_required");
          return allowed;
        }

        const allowed = !!token;
        if (!allowed) logAccessDenied("auth_required");
        return allowed;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
