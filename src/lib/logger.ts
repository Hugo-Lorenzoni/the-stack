import pino from 'pino';

// Read directly from process.env to avoid circular dependencies with env.ts
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service:      process.env.SERVICE_NAME    ?? 'cpv-app',
    version:      process.env.SERVICE_VERSION ?? 'unknown',
    commit_hash:  process.env.COMMIT_SHA      ?? 'unknown',
    node_version: process.version,
    environment:  process.env.NODE_ENV        ?? 'production',
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});
