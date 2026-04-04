import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Property-based tests for src/lib/withLogging.ts
 * Validates: Requirements 3.3, 3.6, 3.7, 6.1, 6.7
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../logger', () => ({
  logger: {
    info:  vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/auth', () => ({
  getNextAuthSession: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { withLogging } from '../withLogging';
import { logger } from '../logger';
import { getNextAuthSession } from '@/utils/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(path = '/api/test', method = 'GET'): NextRequest {
  return new NextRequest(`http://localhost${path}`, { method });
}

function makeCtx() {
  return { params: Promise.resolve({}), wideEvent: {} };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a handler that resolves with a given status code */
const successHandlerArb = fc
  .integer({ min: 200, max: 399 })
  .map((status) => async () => NextResponse.json({}, { status }));

/** Generates a handler that throws a given value */
const throwingHandlerArb = fc
  .oneof(
    fc.string().map((msg) => new Error(msg)),
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.constant(undefined),
    fc.record({ code: fc.integer(), detail: fc.string() }),
  )
  .map((thrown) => async (): Promise<never> => {
    throw thrown;
  });

/** Generates either a success or throwing handler */
const anyHandlerArb = fc.oneof(successHandlerArb, throwingHandlerArb);

/** Generates arbitrary thrown values (all JS types) */
const thrownValueArb = fc.oneof(
  fc.string().map((msg) => new Error(msg)),
  fc.string().map((msg) => { const e = new TypeError(msg); return e; }),
  fc.string().map((msg) => { const e = new RangeError(msg); return e; }),
  fc.string(),
  fc.integer(),
  fc.float({ noNaN: true }),
  fc.boolean(),
  fc.constant(null),
  fc.constant(undefined),
  fc.record({ message: fc.string(), code: fc.integer() }),
  fc.constant({}),
);

// ---------------------------------------------------------------------------
// Property 4: withLogging always calls logger.info exactly once per invocation
// ---------------------------------------------------------------------------

// Feature: production-logging, Property 4: withLogging always calls logger.info exactly once per invocation

describe('Property 4: withLogging always calls logger.info exactly once per invocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
  });

  it(
    'calls logger.info or logger.error exactly once regardless of whether the handler succeeds or throws',
    async () => {
      await fc.assert(
        fc.asyncProperty(anyHandlerArb, async (handler) => {
          vi.clearAllMocks();

          const wrapped = withLogging(handler);
          try {
            await wrapped(makeRequest(), makeCtx());
          } catch {
            // expected for throwing handlers
          }

          const totalCalls =
            vi.mocked(logger.info).mock.calls.length +
            vi.mocked(logger.error).mock.calls.length;
          expect(totalCalls).toBe(1);
        }),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 5: wideEvent.duration_ms is always a non-negative integer
// ---------------------------------------------------------------------------

// Feature: production-logging, Property 5: wideEvent.duration_ms is always a non-negative integer

describe('Property 5: wideEvent.duration_ms is always a non-negative integer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
  });

  it(
    'duration_ms is a non-negative number for any handler outcome',
    async () => {
      await fc.assert(
        fc.asyncProperty(anyHandlerArb, async (handler) => {
          vi.clearAllMocks();

          const wrapped = withLogging(handler);
          try {
            await wrapped(makeRequest(), makeCtx());
          } catch {
            // expected for throwing handlers
          }

          const totalCalls =
            vi.mocked(logger.info).mock.calls.length +
            vi.mocked(logger.error).mock.calls.length;
          expect(totalCalls).toBe(1);
          const wideEvent = (
            vi.mocked(logger.info).mock.calls[0] ??
            vi.mocked(logger.error).mock.calls[0]
          )[0] as Record<string, unknown>;

          expect(typeof wideEvent.duration_ms).toBe('number');
          expect(wideEvent.duration_ms as number).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 6: error serialisation — wideEvent.error is always { message: string, type: string }
// ---------------------------------------------------------------------------

// Feature: production-logging, Property 6: When a handler throws any value, wideEvent.error is always { message: string, type: string } with no raw Error objects

describe('Property 6: When a handler throws any value, wideEvent.error is always { message: string, type: string } with no raw Error objects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
  });

  it(
    'wideEvent.error is always { message: string, type: string } and never a raw Error object',
    async () => {
      await fc.assert(
        fc.asyncProperty(thrownValueArb, async (thrown) => {
          vi.clearAllMocks();

          const handler = withLogging(async (): Promise<never> => {
            throw thrown;
          });

          // handler always re-throws; catch it regardless of thrown value type
          let threw = false;
          try {
            await handler(makeRequest(), makeCtx());
          } catch {
            threw = true;
          }
          expect(threw).toBe(true);

          expect(vi.mocked(logger.error)).toHaveBeenCalledTimes(1);
          const wideEvent = vi.mocked(logger.error).mock.calls[0][0] as Record<string, unknown>;

          // error field must be present
          expect(wideEvent.error).toBeDefined();

          const error = wideEvent.error as Record<string, unknown>;

          // must be a plain object, not a raw Error instance
          expect(error instanceof Error).toBe(false);

          // must have message and type as strings
          expect(typeof error.message).toBe('string');
          expect(typeof error.type).toBe('string');

          // must not contain raw Error objects at any level
          for (const value of Object.values(error)) {
            expect(value instanceof Error).toBe(false);
          }
        }),
        { numRuns: 100 },
      );
    },
  );
});
