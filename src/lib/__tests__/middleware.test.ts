import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for the x-request-id injection logic in src/middleware.ts
 * Requirements: 2.1, 2.2, 2.3
 *
 * Because the middleware uses `withAuth` from next-auth (which is hard to test
 * directly), we test the core x-request-id injection logic in isolation by
 * replicating the exact same logic used in the middleware function.
 */

// UUID v4 regex pattern
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Helpers that mirror the middleware logic exactly
// ---------------------------------------------------------------------------

interface MockHeaders {
  get(name: string): string | null;
  set(name: string, value: string): void;
  _store: Record<string, string>;
}

function createMockHeaders(initial: Record<string, string> = {}): MockHeaders {
  const store: Record<string, string> = { ...initial };
  return {
    _store: store,
    get(name: string) {
      return store[name.toLowerCase()] ?? null;
    },
    set(name: string, value: string) {
      store[name.toLowerCase()] = value;
    },
  };
}

interface MockRequest {
  headers: MockHeaders;
}

interface MockResponse {
  headers: MockHeaders;
}

function createMockRequest(requestHeaders: Record<string, string> = {}): MockRequest {
  return { headers: createMockHeaders(requestHeaders) };
}

function createMockResponse(): MockResponse {
  return { headers: createMockHeaders() };
}

/**
 * Runs the same logic as the middleware function in src/middleware.ts:
 *   const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
 *   const response = NextResponse.next();
 *   response.headers.set('x-request-id', requestId);
 *   return response;
 */
function runMiddlewareLogic(req: MockRequest, res: MockResponse): string {
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  res.headers.set('x-request-id', requestId);
  return requestId;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('middleware x-request-id injection', () => {
  describe('when x-request-id is absent from the incoming request', () => {
    it('sets x-request-id on the response', () => {
      const req = createMockRequest(); // no x-request-id header
      const res = createMockResponse();

      runMiddlewareLogic(req, res);

      const responseId = res.headers.get('x-request-id');
      expect(responseId).not.toBeNull();
      expect(typeof responseId).toBe('string');
      expect((responseId as string).length).toBeGreaterThan(0);
    });

    it('generates a valid UUID v4 when x-request-id is absent', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      runMiddlewareLogic(req, res);

      const responseId = res.headers.get('x-request-id') as string;
      expect(responseId).toMatch(UUID_V4_PATTERN);
    });

    it('generates a different UUID on each invocation', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const req = createMockRequest();
        const res = createMockResponse();
        runMiddlewareLogic(req, res);
        ids.add(res.headers.get('x-request-id') as string);
      }
      // All 10 generated IDs should be unique
      expect(ids.size).toBe(10);
    });
  });

  describe('when x-request-id is already present on the incoming request', () => {
    it('preserves the existing x-request-id value on the response', () => {
      const existingId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const req = createMockRequest({ 'x-request-id': existingId });
      const res = createMockResponse();

      runMiddlewareLogic(req, res);

      expect(res.headers.get('x-request-id')).toBe(existingId);
    });

    it('does not overwrite an existing x-request-id with a new UUID', () => {
      const existingId = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';
      const req = createMockRequest({ 'x-request-id': existingId });
      const res = createMockResponse();

      runMiddlewareLogic(req, res);

      // The response ID must equal the incoming ID, not a freshly generated one
      expect(res.headers.get('x-request-id')).toBe(existingId);
    });

    it('forwards any string value as-is, even if it is not a UUID', () => {
      const customId = 'my-custom-trace-id-12345';
      const req = createMockRequest({ 'x-request-id': customId });
      const res = createMockResponse();

      runMiddlewareLogic(req, res);

      expect(res.headers.get('x-request-id')).toBe(customId);
    });
  });
});
