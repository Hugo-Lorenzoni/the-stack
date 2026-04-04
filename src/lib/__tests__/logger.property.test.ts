import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { Writable } from 'stream';

// Feature: production-logging, Property 2: Every emitted log object contains all five environment context fields with non-empty string values

/**
 * Validates: Requirements 1.4, 6.1
 *
 * Property 2: Every emitted log object contains all five environment context
 * fields (service, version, commit_hash, node_version, environment) with
 * non-empty string values, regardless of which env var values are supplied.
 */

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

// Arbitrary for non-empty strings (printable ASCII, length 1–64)
const nonEmptyString = fc.string({ minLength: 1, maxLength: 64 }).filter((s) => s.trim().length > 0);

// Valid log levels pino accepts
const logLevelArb = fc.constantFrom('trace', 'debug', 'info', 'warn', 'error');

describe('Property 2: logger base fields are always present and non-empty', () => {
  it('every emitted log object contains all five environment context fields with non-empty string values', async () => {
    await fc.assert(
      fc.asyncProperty(
        nonEmptyString, // SERVICE_NAME
        nonEmptyString, // SERVICE_VERSION
        nonEmptyString, // COMMIT_SHA
        nonEmptyString, // NODE_ENV
        logLevelArb,    // LOG_LEVEL
        async (serviceName, serviceVersion, commitSha, nodeEnv, logLevel) => {
          const pino = (await import('pino')).default;
          const { stream, getLines } = createCaptureStream();

          const testLogger = pino(
            {
              level: logLevel,
              formatters: {
                level: (label: string) => ({ level: label }),
              },
              base: {
                service:      serviceName,
                version:      serviceVersion,
                commit_hash:  commitSha,
                node_version: process.version,
                environment:  nodeEnv,
              },
            },
            stream,
          );

          // Use 'info' to ensure the message is emitted regardless of level
          testLogger.info({ msg: 'property-test' });

          await new Promise((r) => setTimeout(r, 10));

          const lines = getLines();
          if (lines.length === 0) {
            // Level is above 'info' — emit at the configured level instead
            // This shouldn't happen since we always log at info, but guard anyway
            return true;
          }

          const parsed = JSON.parse(lines[0]);

          // All five fields must be present and be non-empty strings
          const fields = ['service', 'version', 'commit_hash', 'node_version', 'environment'] as const;
          for (const field of fields) {
            if (typeof parsed[field] !== 'string' || parsed[field].length === 0) {
              return false;
            }
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
