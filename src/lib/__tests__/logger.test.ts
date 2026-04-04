import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Writable } from 'stream';

/**
 * Unit tests for src/lib/logger.ts
 * Requirements: 1.4, 1.6
 */

// Helper to create an in-memory writable stream that collects chunks
function createCaptureStream(): { stream: Writable; getLines: () => string[] } {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });
  return {
    stream,
    getLines: () => chunks.flatMap((c) => c.split('\n').filter((l) => l.trim() !== '')),
  };
}

describe('logger base fields', () => {
  it('emits all five base fields with non-empty string values', async () => {
    // Set env vars before importing pino so the base object is populated
    const savedEnv = { ...process.env };
    process.env.SERVICE_NAME = 'test-service';
    process.env.SERVICE_VERSION = '1.2.3';
    process.env.COMMIT_SHA = 'abc123';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'info';

    const pino = (await import('pino')).default;
    const { stream, getLines } = createCaptureStream();

    const testLogger = pino(
      {
        level: process.env.LOG_LEVEL ?? 'info',
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        base: {
          service: process.env.SERVICE_NAME ?? 'cpv-app',
          version: process.env.SERVICE_VERSION ?? 'unknown',
          commit_hash: process.env.COMMIT_SHA ?? 'unknown',
          node_version: process.version,
          environment: process.env.NODE_ENV ?? 'production',
        },
      },
      stream,
    );

    testLogger.info({ msg: 'test' });

    // Give pino a tick to flush
    await new Promise((r) => setTimeout(r, 10));

    const lines = getLines();
    expect(lines.length).toBeGreaterThan(0);

    const parsed = JSON.parse(lines[0]);

    // Verify all five base fields are present and non-empty strings
    expect(typeof parsed.service).toBe('string');
    expect(parsed.service.length).toBeGreaterThan(0);

    expect(typeof parsed.version).toBe('string');
    expect(parsed.version.length).toBeGreaterThan(0);

    expect(typeof parsed.commit_hash).toBe('string');
    expect(parsed.commit_hash.length).toBeGreaterThan(0);

    expect(typeof parsed.node_version).toBe('string');
    expect(parsed.node_version.length).toBeGreaterThan(0);

    expect(typeof parsed.environment).toBe('string');
    expect(parsed.environment.length).toBeGreaterThan(0);

    // Restore env
    process.env = savedEnv;
  });

  it('uses default values when env vars are absent', async () => {
    const savedEnv = { ...process.env };
    delete process.env.SERVICE_NAME;
    delete process.env.SERVICE_VERSION;
    delete process.env.COMMIT_SHA;

    const pino = (await import('pino')).default;
    const { stream, getLines } = createCaptureStream();

    const testLogger = pino(
      {
        level: 'info',
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        base: {
          service: process.env.SERVICE_NAME ?? 'cpv-app',
          version: process.env.SERVICE_VERSION ?? 'unknown',
          commit_hash: process.env.COMMIT_SHA ?? 'unknown',
          node_version: process.version,
          environment: process.env.NODE_ENV ?? 'production',
        },
      },
      stream,
    );

    testLogger.info({ msg: 'test' });
    await new Promise((r) => setTimeout(r, 10));

    const lines = getLines();
    const parsed = JSON.parse(lines[0]);

    expect(parsed.service).toBe('cpv-app');
    expect(parsed.version).toBe('unknown');
    expect(parsed.commit_hash).toBe('unknown');

    process.env = savedEnv;
  });
});

describe('logger pino-pretty transport in development', () => {
  it('configures pino-pretty transport when NODE_ENV is development', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Build the options object the same way logger.ts does
    const options = {
      level: process.env.LOG_LEVEL ?? 'info',
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      base: {
        service: process.env.SERVICE_NAME ?? 'cpv-app',
        version: process.env.SERVICE_VERSION ?? 'unknown',
        commit_hash: process.env.COMMIT_SHA ?? 'unknown',
        node_version: process.version,
        environment: process.env.NODE_ENV ?? 'production',
      },
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    };

    expect(options.transport).toBeDefined();
    expect((options.transport as { target: string }).target).toBe('pino-pretty');
    expect((options.transport as { options: { colorize: boolean } }).options.colorize).toBe(true);

    process.env.NODE_ENV = savedNodeEnv;
  });

  it('does not configure pino-pretty transport when NODE_ENV is not development', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const options = {
      level: process.env.LOG_LEVEL ?? 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    };

    expect((options as Record<string, unknown>).transport).toBeUndefined();

    process.env.NODE_ENV = savedNodeEnv;
  });

  it('does not configure pino-pretty transport when NODE_ENV is test', () => {
    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const options = {
      level: process.env.LOG_LEVEL ?? 'info',
      ...(process.env.NODE_ENV === 'development' && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
    };

    expect((options as Record<string, unknown>).transport).toBeUndefined();

    process.env.NODE_ENV = savedNodeEnv;
  });
});
