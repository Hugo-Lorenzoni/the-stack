import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Property-based tests for wideEvent.outcome validity
 * Validates: Requirements 3.5, 3.6, 4.7, 4.8, 6.1
 */

// Feature: production-logging, Property 11: wideEvent.outcome is always exactly 'success' or 'error', never any other value or undefined

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('@/utils/auth', () => ({
  getNextAuthSession: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { withLogging } from '../withLogging';
import { logger } from '@/lib/logger';
import { getNextAuthSession } from '@/utils/auth';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates 2xx HTTP status codes */
const status2xxArb = fc.integer({ min: 200, max: 299 });

/** Generates 4xx HTTP status codes */
const status4xxArb = fc.integer({ min: 400, max: 499 });

/** Generates 5xx HTTP status codes */
const status5xxArb = fc.integer({ min: 500, max: 599 });

/** Generates any non-2xx status code (4xx or 5xx) */
const statusErrorArb = fc.oneof(status4xxArb, status5xxArb);

/** Generates any HTTP status code */
const anyStatusArb = fc.oneof(status2xxArb, status4xxArb, status5xxArb);

/** Generates arbitrary error messages */
const errorMessageArb = fc.string({ minLength: 1, maxLength: 100 });

// ---------------------------------------------------------------------------
// Property 11: wideEvent.outcome is always exactly 'success' or 'error'
// ---------------------------------------------------------------------------

describe("Property 11: wideEvent.outcome is always exactly 'success' or 'error', never any other value or undefined", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
  });

  it(
    "withLogging: outcome is 'success' or 'error' for any 2xx status code",
    async () => {
      await fc.assert(
        fc.asyncProperty(status2xxArb, async (statusCode) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () =>
            new NextResponse(null, { status: statusCode }),
          );
          const req = new NextRequest('http://localhost/api/test', {
            method: 'GET',
          });

          await handler(req, { params: Promise.resolve({}), wideEvent: {} });

          const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
          expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
          expect(wideEvent.outcome).toBe('success');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "withLogging: outcome is 'error' for any 4xx status code",
    async () => {
      await fc.assert(
        fc.asyncProperty(status4xxArb, async (statusCode) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () =>
            new NextResponse(null, { status: statusCode }),
          );
          const req = new NextRequest('http://localhost/api/test', {
            method: 'GET',
          });

          await handler(req, { params: Promise.resolve({}), wideEvent: {} });

          const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
          expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
          expect(wideEvent.outcome).toBe('error');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "withLogging: outcome is 'error' for any 5xx status code returned by handler",
    async () => {
      await fc.assert(
        fc.asyncProperty(status5xxArb, async (statusCode) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () =>
            new NextResponse(null, { status: statusCode }),
          );
          const req = new NextRequest('http://localhost/api/test', {
            method: 'GET',
          });

          await handler(req, { params: Promise.resolve({}), wideEvent: {} });

          const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
          expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
          expect(wideEvent.outcome).toBe('error');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "withLogging: outcome is always 'success' or 'error' for any HTTP status code",
    async () => {
      await fc.assert(
        fc.asyncProperty(anyStatusArb, async (statusCode) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () =>
            new NextResponse(null, { status: statusCode }),
          );
          const req = new NextRequest('http://localhost/api/test', {
            method: 'GET',
          });

          await handler(req, { params: Promise.resolve({}), wideEvent: {} });

          const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
          expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
          expect(wideEvent.outcome).not.toBeUndefined();
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "withLogging: outcome is 'error' when handler throws an Error",
    async () => {
      await fc.assert(
        fc.asyncProperty(errorMessageArb, async (errorMessage) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () => {
            throw new Error(errorMessage);
          });
          const req = new NextRequest('http://localhost/api/test', {
            method: 'POST',
          });

          await expect(
            handler(req, { params: Promise.resolve({}), wideEvent: {} }),
          ).rejects.toThrow();

          const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
          expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
          expect(wideEvent.outcome).toBe('error');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "withLogging: outcome is 'error' when handler throws a non-Error value",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(fc.string(), fc.integer(), fc.boolean()),
          async (thrownValue) => {
            vi.clearAllMocks();
            vi.mocked(getNextAuthSession).mockResolvedValue(null);

            const handler = withLogging(async () => {
              // eslint-disable-next-line @typescript-eslint/no-throw-literal
              throw thrownValue;
            });
            const req = new NextRequest('http://localhost/api/test', {
              method: 'POST',
            });

            await expect(
              handler(req, { params: Promise.resolve({}), wideEvent: {} }),
            ).rejects.toBeDefined();

            const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
            expect(wideEvent.outcome === 'success' || wideEvent.outcome === 'error').toBe(true);
            expect(wideEvent.outcome).toBe('error');
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
