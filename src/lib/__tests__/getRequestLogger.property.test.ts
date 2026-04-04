import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property-based tests for src/lib/getRequestLogger.ts
 * Validates: Requirements 4.5, 6.1
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGet = vi.fn();

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({ get: mockGet })),
}));

vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { getRequestLogger } from '../getRequestLogger';
import { logger } from '../logger';

// ---------------------------------------------------------------------------
// Property Tests
// ---------------------------------------------------------------------------

describe('getRequestLogger – property tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it(
    // Feature: production-logging, Property 7: emit() always sets wideEvent.duration_ms to a value >= 0 before calling logger.info
    'Property 7: emit() always sets wideEvent.duration_ms to a value >= 0 before calling logger.info',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary page strings
          fc.string({ minLength: 1, maxLength: 100 }),
          async (page) => {
            vi.clearAllMocks();

            const { emit } = await getRequestLogger(page);
            emit();

            expect(vi.mocked(logger.info)).toHaveBeenCalledOnce();
            const logged = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;

            expect(typeof logged.duration_ms).toBe('number');
            expect(logged.duration_ms as number).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
