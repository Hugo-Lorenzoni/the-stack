import { mkdirSync } from "fs";
import { dirname } from "path";
import pino from "pino";
import pretty from "pino-pretty";

const isDevelopment = process.env.NODE_ENV === "development";

const logFilePath = process.env.LOG_FILE_PATH?.trim();

let fileDestination: pino.DestinationStream | undefined;

if (logFilePath) {
  mkdirSync(dirname(logFilePath), { recursive: true });
  fileDestination = pino.destination({ dest: logFilePath, sync: false });
}

const streams: pino.StreamEntry[] = [
  {
    stream: isDevelopment
      ? pretty({ colorize: true, sync: true })
      : process.stdout,
  },
  ...(fileDestination ? [{ stream: fileDestination }] : []),
];

const loggerStream = pino.multistream(streams);

// Read directly from process.env to avoid circular dependencies with env.ts
export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      service: process.env.SERVICE_NAME ?? "cpv-app",
      version: process.env.SERVICE_VERSION ?? "unknown",
      commit_hash: process.env.COMMIT_SHA ?? "unknown",
      node_version: process.version,
      environment: process.env.NODE_ENV ?? "production",
    },
  },
  loggerStream,
);

type LogLevel = "info" | "error";

function getErrorDetails(err: unknown) {
  if (err instanceof Error) {
    return { message: err.message, type: err.name };
  }
  return { message: String(err), type: "Error" };
}

function getPayloadKeys(payload: unknown): string[] {
  if (payload !== null && typeof payload === "object") {
    return Object.keys(payload as Record<string, unknown>).slice(0, 20);
  }
  return [];
}

function onLoggerFailure(level: LogLevel, payload: unknown, err: unknown) {
  const event = {
    event: "logging.write_failed",
    attempted_level: level,
    error: getErrorDetails(err),
    payload_keys: getPayloadKeys(payload),
    timestamp: new Date().toISOString(),
  };

  try {
    console.error(JSON.stringify(event));
  } catch {
    console.error("logging.write_failed");
  }
}

function safeLog(level: LogLevel, payload: unknown) {
  try {
    if (level === "error") {
      logger.error(payload);
      return;
    }
    logger.info(payload);
  } catch (err) {
    onLoggerFailure(level, payload, err);
  }
}

export function safeInfo(payload: unknown) {
  safeLog("info", payload);
}

export function safeError(payload: unknown) {
  safeLog("error", payload);
}
