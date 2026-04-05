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
