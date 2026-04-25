import posthog from "posthog-js";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (posthogToken) {
  posthog.init(posthogToken, {
    // Send browser events through Next.js rewrites to reduce client-side blocking.
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
  });
} else {
  console.warn(
    "PostHog project token is not set. Please set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN in your environment variables to enable analytics.",
  );
}
