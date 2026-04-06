import { isAuthorizedPath, type AuthRole } from "@/lib/auth-authorization";
import { NextRequest, NextResponse } from "next/server";

type SessionResponse = {
  user?: {
    role?: AuthRole;
  };
};

async function getRoleFromSession(
  req: NextRequest,
): Promise<AuthRole | undefined> {
  const sessionUrl = new URL("/api/auth/get-session", req.url);

  try {
    const response = await fetch(sessionUrl, {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as SessionResponse;
    return data.user?.role;
  } catch {
    return undefined;
  }
}

export default async function middleware(req: NextRequest) {
  const role = await getRoleFromSession(req);

  if (!isAuthorizedPath(req.nextUrl.pathname, role)) {
    const redirectUrl = new URL(role ? "/" : "/connexion", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

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
