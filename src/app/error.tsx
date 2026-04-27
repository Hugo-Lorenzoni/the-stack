"use client";
import posthog from "posthog-js";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h2>Une erreur est survenue&nbsp;!</h2>
      <Button
        onClick={
          // Attempt to recover by re-fetching and re-rendering the segment
          () => reset()
        }
      >
        Réessayer
      </Button>
    </div>
  );
}
