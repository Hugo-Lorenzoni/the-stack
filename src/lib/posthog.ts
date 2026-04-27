import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null = null;

function getPostHogServer(): PostHog | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) {
    return null;
  }
  if (!posthogInstance) {
    posthogInstance = new PostHog(token, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogInstance;
}

export const postHogServerClient = new Proxy({} as PostHog, {
  get(_target, prop) {
    const client = getPostHogServer();
    if (!client) {
      return () => {};
    }
    const value = client[prop as keyof PostHog];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
