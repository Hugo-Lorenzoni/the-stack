"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import posthog from "posthog-js";
import { useEffect } from "react";
// import NextError from "next/error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    posthog.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
          <h2>Une erreur inconnue s&apos;est produite!</h2>
          <Button
            onClick={
              // Attempt to recover by re-fetching and re-rendering the segment
              () => reset()
            }
          >
            Réessayer
          </Button>
        </div>
      </body>
    </html>
  );
}
