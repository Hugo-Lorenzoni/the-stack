// Feature: production-logging, Property 1: Optional logging env vars never cause Zod parse failure when absent

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { EnvSchema } from '../env';

/**
 * Validates: Requirements 8.5
 *
 * Property 1: Optional logging env vars never cause Zod parse failure when absent.
 * For any arbitrary combination of the four optional logging env vars
 * (LOG_LEVEL, SERVICE_NAME, SERVICE_VERSION, COMMIT_SHA) — some present, some absent —
 * the EnvSchema.safeParse() must never return success: false due to those fields.
 */

const BASE_ENV = {
  DATA_FOLDER: 'data',
  MYSQL_ROOT_PASSWORD: 'secret',
  MYSQL_DATABASE: 'testdb',
  MYSQL_USER: 'user',
  MYSQL_PASSWORD: 'pass',
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: '3306',
  DATABASE_URL: 'mysql://user:pass@localhost:3306/testdb',
  NEXTAUTH_SECRET: 'supersecret',
  NEXTAUTH_URL: 'http://localhost:3000',
  EMAIL: 'test@example.com',
};

const optionalStringOrAbsent = fc.option(fc.string({ minLength: 1 }), { nil: undefined });

describe('EnvSchema — optional logging env vars', () => {
  it('never causes a parse failure when optional logging fields are absent or present', () => {
    fc.assert(
      fc.property(
        optionalStringOrAbsent,
        optionalStringOrAbsent,
        optionalStringOrAbsent,
        optionalStringOrAbsent,
        (logLevel, serviceName, serviceVersion, commitSha) => {
          const input: Record<string, string | undefined> = { ...BASE_ENV };

          if (logLevel !== undefined) input.LOG_LEVEL = logLevel;
          if (serviceName !== undefined) input.SERVICE_NAME = serviceName;
          if (serviceVersion !== undefined) input.SERVICE_VERSION = serviceVersion;
          if (commitSha !== undefined) input.COMMIT_SHA = commitSha;

          const result = EnvSchema.safeParse(input);
          return result.success === true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
