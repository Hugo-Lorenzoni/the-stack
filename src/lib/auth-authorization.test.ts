import { describe, expect, it } from "vitest";
import { isAuthorizedPath } from "@/lib/auth-authorization";

describe("isAuthorizedPath", () => {
  it("rejects admin routes for non-admin users", () => {
    expect(isAuthorizedPath("/admin", "USER")).toBe(false);
    expect(isAuthorizedPath("/api/admin/accounts", "BAPTISE")).toBe(false);
  });

  it("accepts admin routes for admins", () => {
    expect(isAuthorizedPath("/admin", "ADMIN")).toBe(true);
    expect(isAuthorizedPath("/api/admin/accounts", "ADMIN")).toBe(true);
  });

  it("restricts baptized routes to BAPTISE and ADMIN", () => {
    expect(isAuthorizedPath("/fpmsevents", "USER")).toBe(false);
    expect(isAuthorizedPath("/videos", "WAITING")).toBe(false);
    expect(isAuthorizedPath("/api/image/BAPTISE/abc", "BAPTISE")).toBe(true);
    expect(isAuthorizedPath("/fpmsevents", "ADMIN")).toBe(true);
  });

  it("requires any authenticated role for protected generic paths", () => {
    expect(isAuthorizedPath("/events", undefined)).toBe(false);
    expect(isAuthorizedPath("/events", null)).toBe(false);
    expect(isAuthorizedPath("/events", "USER")).toBe(true);
  });
});
