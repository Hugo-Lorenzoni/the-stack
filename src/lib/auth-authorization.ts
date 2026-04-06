export type AuthRole = "USER" | "WAITING" | "BAPTISE" | "ADMIN";

export function isAuthorizedPath(
  pathname: string,
  role: AuthRole | null | undefined,
): boolean {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return role === "ADMIN";
  }

  if (
    pathname.startsWith("/fpmsevents") ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/api/image/BAPTISE")
  ) {
    return role === "BAPTISE" || role === "ADMIN";
  }

  return Boolean(role);
}
