import { Instrumentation } from "next";
import { postHogServerClient } from "./lib/posthog";

export function register() {
  // No-op for initialization
}
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    let distinctId = null;
    if (request.headers.cookie) {
      // Normalize multiple cookie arrays to string
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join("; ")
        : request.headers.cookie;
      const postHogCookieMatch = cookieString.match(
        /ph_phc_.*?_posthog=([^;]+)/,
      );
      if (postHogCookieMatch && postHogCookieMatch[1]) {
        try {
          const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
          const postHogData = JSON.parse(decodedCookie);
          distinctId = postHogData.distinct_id;
        } catch (e) {
          postHogServerClient.captureException(
            e,
            "Error parsing PostHog cookie",
          );
        }
      }
    }
    postHogServerClient.captureException(err, distinctId || undefined);
  }
};
