import { describe, expect, it } from "vitest";
import { mapBetterAuthSession } from "@/utils/auth-session";

describe("mapBetterAuthSession", () => {
  it("returns null when there is no session", () => {
    expect(mapBetterAuthSession(null as never)).toBeNull();
  });

  it("maps Better Auth user shape to legacy session shape", () => {
    const mapped = mapBetterAuthSession({
      user: {
        id: "user-id",
        email: "hello@example.com",
        name: "Jane",
        surname: "Doe",
        role: "ADMIN",
      },
    } as never);

    expect(mapped).toEqual({
      user: {
        id: "user-id",
        email: "hello@example.com",
        name: "Jane",
        surname: "Doe",
        role: "ADMIN",
      },
    });
  });

  it("falls back to empty surname when absent", () => {
    const mapped = mapBetterAuthSession({
      user: {
        id: "user-id",
        email: "hello@example.com",
        name: "Jane",
      },
    } as never);

    expect(mapped?.user.surname).toBe("");
  });
});
