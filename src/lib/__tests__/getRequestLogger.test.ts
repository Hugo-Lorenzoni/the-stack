import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for src/lib/getRequestLogger.ts
 * Requirements: 4.2, 4.3, 4.5
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

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getRequestLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request_id from x-request-id header', () => {
    it('uses the x-request-id header value when present (Requirement 4.2)', async () => {
      const expectedId = '550e8400-e29b-41d4-a716-446655440000';
      mockGet.mockImplementation((name: string) =>
        name === 'x-request-id' ? expectedId : null,
      );

      const { wideEvent } = await getRequestLogger('/test-page');

      expect(wideEvent.request_id).toBe(expectedId);
    });
  });

  describe('UUID fallback when header is absent', () => {
    it('generates a UUID v4 when x-request-id header is absent (Requirement 4.3)', async () => {
      mockGet.mockReturnValue(null);

      const { wideEvent } = await getRequestLogger('/test-page');

      expect(typeof wideEvent.request_id).toBe('string');
      expect(wideEvent.request_id as string).toMatch(UUID_V4_REGEX);
    });

    it('generates a different UUID on each call when header is absent', async () => {
      mockGet.mockReturnValue(null);

      const { wideEvent: ctx1 } = await getRequestLogger('/page-a');
      const { wideEvent: ctx2 } = await getRequestLogger('/page-b');

      expect(ctx1.request_id).not.toBe(ctx2.request_id);
    });
  });

  describe('emit() sets duration_ms', () => {
    it('sets duration_ms to a non-negative number (Requirement 4.5)', async () => {
      mockGet.mockReturnValue(null);

      const { emit } = await getRequestLogger('/test-page');
      emit();

      expect(logger.info).toHaveBeenCalledOnce();
      const logged = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
      expect(typeof logged.duration_ms).toBe('number');
      expect(logged.duration_ms as number).toBeGreaterThanOrEqual(0);
    });

    it('calls logger.info exactly once when emit() is called', async () => {
      mockGet.mockReturnValue(null);

      const { emit } = await getRequestLogger('/test-page');
      emit();

      expect(logger.info).toHaveBeenCalledOnce();
    });

    it('includes the wideEvent fields in the logger.info call', async () => {
      const requestId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
      mockGet.mockImplementation((name: string) =>
        name === 'x-request-id' ? requestId : null,
      );

      const { wideEvent, emit } = await getRequestLogger('/events');
      wideEvent.outcome = 'success';
      emit();

      const logged = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
      expect(logged.request_id).toBe(requestId);
      expect(logged.page).toBe('/events');
      expect(logged.render_type).toBe('ssr');
      expect(logged.outcome).toBe('success');
    });
  });
});
