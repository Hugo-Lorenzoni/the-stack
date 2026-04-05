import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";

const serviceName = process.env.OTEL_SERVICE_NAME ?? "the-stack";
const posthogProjectToken =
  process.env.POSTHOG_PROJECT_TOKEN ??
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogLogsUrl =
  process.env.POSTHOG_OTLP_LOGS_URL ?? "https://eu.i.posthog.com/i/v1/logs";

const processors = [];

if (posthogProjectToken) {
  processors.push(
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: posthogLogsUrl,
        headers: {
          Authorization: `Bearer ${posthogProjectToken}`,
          "Content-Type": "application/json",
        },
      }),
    ),
  );
} else if (process.env.NODE_ENV !== "production") {
  console.warn(
    "[otel] Missing POSTHOG_PROJECT_TOKEN (or NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN). OpenTelemetry logs will not be exported.",
  );
}

// Exported so route handlers can forceFlush() before serverless freeze.
export const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ "service.name": serviceName }),
  processors,
});

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logs.setGlobalLoggerProvider(loggerProvider);
  }
}

function getCookieHeader(request: unknown): string | null {
  if (!request || typeof request !== "object") {
    return null;
  }

  // Next passes a request-like object with a Headers instance in Node runtime.
  const maybeRequest = request as {
    headers?: Headers | { cookie?: string | string[] };
  };
  if (!maybeRequest.headers) {
    return null;
  }

  if (typeof (maybeRequest.headers as Headers).get === "function") {
    return (maybeRequest.headers as Headers).get("cookie");
  }

  const cookieHeader = (maybeRequest.headers as { cookie?: string | string[] })
    .cookie;
  if (Array.isArray(cookieHeader)) {
    return cookieHeader.join("; ");
  }

  return cookieHeader ?? null;
}

function getDistinctIdFromPostHogCookie(
  cookieHeader: string | null,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const postHogCookieMatch = cookieHeader.match(/ph_phc_.*?_posthog=([^;]+)/);
  if (!postHogCookieMatch?.[1]) {
    return undefined;
  }

  try {
    const decodedCookie = decodeURIComponent(postHogCookieMatch[1]);
    const postHogData = JSON.parse(decodedCookie) as { distinct_id?: string };
    return postHogData.distinct_id;
  } catch (error) {
    console.error("Error parsing PostHog cookie:", error);
    return undefined;
  }
}

export const onRequestError = async (
  err: unknown,
  request: unknown,
  context?: unknown,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { getPostHogServer } = await import("@/lib/posthog-server");
  const posthog = getPostHogServer();

  const cookieHeader = getCookieHeader(request);
  const distinctId = getDistinctIdFromPostHogCookie(cookieHeader);

  posthog.captureException(err, distinctId, {
    source: "next_onRequestError",
    has_context: Boolean(context),
  });
};
