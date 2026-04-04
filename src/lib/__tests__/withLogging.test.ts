import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Unit tests for src/lib/withLogging.ts
 * Requirements: 3.5, 3.6, 3.8, 3.9
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock logger so we can capture what gets logged
vi.mock('../logger', () => ({
  logger: {
    info:  vi.fn(),
    error: vi.fn(),
  },
}));

// Mock getNextAuthSession to control session state
vi.mock('@/utils/auth', () => ({
  getNextAuthSession: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('withLogging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful handler', () => {
    it('sets outcome to "success" with correct status_code, duration_ms >= 0, and user fields', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue({
        user: { id: 'user-123', role: 'ADMIN', name: null, email: null },
        expires: '',
      });

      const handler = withLogging(async (_req, { wideEvent }) => {
        wideEvent.action = 'test_action';
        return NextResponse.json({ ok: true }, { status: 200 });
      });

      const req = makeRequest('/api/test', 'POST');
      const response = await handler(req, { params: Promise.resolve({}), wideEvent: {} });

      expect(response.status).toBe(200);

      expect(logger.info).toHaveBeenCalledOnce();
      const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;

      expect(wideEvent.outcome).toBe('success');
      expect(wideEvent.status_code).toBe(200);
      expect(typeof wideEvent.duration_ms).toBe('number');
      expect(wideEvent.duration_ms as number).toBeGreaterThanOrEqual(0);
      expect(wideEvent.user).toEqual({ id: 'user-123', role: 'ADMIN' });
    });

    it('calls logger.info exactly once', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue({
        user: { id: 'u1', role: 'USER', name: null, email: null },
        expires: '',
      });

      const handler = withLogging(async () => NextResponse.json({}, { status: 201 }));
      await handler(makeRequest(), { params: Promise.resolve({}), wideEvent: {} });

      expect(logger.info).toHaveBeenCalledOnce();
    });
  });

  describe('throwing handler', () => {
    it('sets outcome to "error", status_code 500, error.message, error.type, and re-throws', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue({
        user: { id: 'u1', role: 'USER', name: null, email: null },
        expires: '',
      });

      const boom = new TypeError('something went wrong');
      const handler = withLogging(async () => {
        throw boom;
      });

      await expect(
        handler(makeRequest(), { params: Promise.resolve({}), wideEvent: {} }),
      ).rejects.toThrow('something went wrong');

      expect(logger.error).toHaveBeenCalledOnce();
      const wideEvent = vi.mocked(logger.error).mock.calls[0][0] as Record<string, unknown>;

      expect(wideEvent.outcome).toBe('error');
      expect(wideEvent.status_code).toBe(500);
      expect(wideEvent.error).toEqual({ message: 'something went wrong', type: 'TypeError' });
    });

    it('still calls logger.error exactly once when the handler throws', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue(null);

      const handler = withLogging(async () => {
        throw new Error('fail');
      });

      await expect(
        handler(makeRequest(), { params: Promise.resolve({}), wideEvent: {} }),
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledOnce();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe('no session present', () => {
    it('sets wideEvent.user to null when getNextAuthSession returns null', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue(null);

      const handler = withLogging(async () => NextResponse.json({}, { status: 200 }));
      await handler(makeRequest(), { params: Promise.resolve({}), wideEvent: {} });

      const wideEvent = vi.mocked(logger.info).mock.calls[0][0] as Record<string, unknown>;
      expect(wideEvent.user).toBeNull();
    });

    it('does not throw when session is absent', async () => {
      vi.mocked(getNextAuthSession).mockResolvedValue(null);

      const handler = withLogging(async () => NextResponse.json({}, { status: 200 }));
      await expect(
        handler(makeRequest(), { params: Promise.resolve({}), wideEvent: {} }),
      ).resolves.toBeDefined();
    });
  });
});
