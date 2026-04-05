"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import posthog from "posthog-js";

function PostHogIdentify() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        role: session.user.role,
      });
    }
  }, [session?.user?.id]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogIdentify />
      {children}
    </SessionProvider>
  );
}
