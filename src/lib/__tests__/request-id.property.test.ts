import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Property-based tests for request_id UUID v4 validity
 * Validates: Requirements 2.2, 3.2, 4.2, 6.1
 */

// Feature: production-logging, Property 10: For any wide event emitted by withLogging or getRequestLogger, request_id matches the UUID v4 regex pattern

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockHeaderGet = vi.fn();

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({ get: mockHeaderGet })),
}));

vi.mock('../logger', () => ({
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
import { getRequestLogger } from '../getRequestLogger';
import { logger } from '../logger';
import { getNextAuthSession } from '@/utils/auth';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates a valid UUID v4 string */
const uuidV4Arb: fc.Arbitrary<string> = fc.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);

/** Generates arbitrary page strings */
const pageArb = fc.string({ minLength: 1, maxLength: 100 });

// ---------------------------------------------------------------------------
// Property 10: request_id is always a valid UUID v4
// ---------------------------------------------------------------------------

describe('Property 10: For any wide event emitted by withLogging or getRequestLogger, request_id matches the UUID v4 regex pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
    mockHeaderGet.mockReturnValue(null);
  });

  it(
    'withLogging: request_id is always a valid UUID v4 when x-request-id header is present',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidV4Arb,
          async (requestId) => {
            vi.clearAllMocks();
            vi.mocked(getNextAuthSession).mockResolvedValue(null);

            const handler = withLogging(async () => NextResponse.json({}, { status: 200 }));
            const req = new NextRequest('http://localhost/api/test', {
              method: 'GET',
              headers: { 'x-request-id': requestId },
            });

            await handler(req, { params: Promise.resolve({}), wideEvent: {} });

            const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
            expect(typeof wideEvent.request_id).toBe('string');
            expect(wideEvent.request_id as string).toMatch(UUID_V4_REGEX);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'withLogging: request_id is always a valid UUID v4 when x-request-id header is absent',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            vi.clearAllMocks();
            vi.mocked(getNextAuthSession).mockResolvedValue(null);

            const handler = withLogging(async () => NextResponse.json({}, { status: 200 }));
            const req = new NextRequest('http://localhost/api/test', { method: 'GET' });

            await handler(req, { params: Promise.resolve({}), wideEvent: {} });

            const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
            expect(typeof wideEvent.request_id).toBe('string');
            expect(wideEvent.request_id as string).toMatch(UUID_V4_REGEX);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getRequestLogger: request_id is always a valid UUID v4 when x-request-id header is present',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          uuidV4Arb,
          pageArb,
          async (requestId, page) => {
            vi.clearAllMocks();
            mockHeaderGet.mockReturnValue(requestId);

            const { emit } = await getRequestLogger(page);
            emit();

            const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
            expect(typeof wideEvent.request_id).toBe('string');
            expect(wideEvent.request_id as string).toMatch(UUID_V4_REGEX);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getRequestLogger: request_id is always a valid UUID v4 when x-request-id header is absent',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          pageArb,
          async (page) => {
            vi.clearAllMocks();
            mockHeaderGet.mockReturnValue(null);

            const { emit } = await getRequestLogger(page);
            emit();

            const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
            expect(typeof wideEvent.request_id).toBe('string');
            expect(wideEvent.request_id as string).toMatch(UUID_V4_REGEX);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
