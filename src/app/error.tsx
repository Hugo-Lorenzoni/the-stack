"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error, {
      source: "app_error_boundary",
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
      <p className="text-muted-foreground max-w-xl text-sm">
        Cette erreur a ete enregistree automatiquement. Vous pouvez reessayer
        l&apos;action.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500"
      >
        Reessayer
      </button>
    </main>
  );
}
