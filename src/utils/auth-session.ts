import { AuthRole } from "@/lib/auth-authorization";

export type BetterAuthSessionLike = {
  user?: {
    id: string;
    email: string;
    name: string;
    surname?: string;
    role?: string;
  };
} | null;

export type LegacySession = {
  user: {
    id: string;
    email: string;
    name: string;
    surname: string;
    role?: AuthRole;
  };
};

export function mapBetterAuthSession(
  session: BetterAuthSessionLike,
): LegacySession | null {
  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      surname: String(session.user.surname ?? ""),
      role: session.user.role as AuthRole | undefined,
    },
  };
}
