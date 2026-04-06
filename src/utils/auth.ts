import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { mapBetterAuthSession, type LegacySession } from "@/utils/auth-session";

export async function getNextAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return mapBetterAuthSession(session);
}
