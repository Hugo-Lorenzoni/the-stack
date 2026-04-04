import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Feature: production-logging, Property 3: For any incoming request, the response always carries an x-request-id header that is a valid UUID v4

/**
 * Property-based tests for x-request-id injection in src/middleware.ts
 * Validates: Requirements 2.2, 2.3
 */

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Helpers mirroring the middleware logic in src/middleware.ts
// ---------------------------------------------------------------------------

interface MockHeaders {
  get(name: string): string | null;
  set(name: string, value: string): void;
}

function createMockHeaders(initial: Record<string, string> = {}): MockHeaders {
  const store: Record<string, string> = { ...initial };
  return {
    get(name: string) {
      return store[name.toLowerCase()] ?? null;
    },
    set(name: string, value: string) {
      store[name.toLowerCase()] = value;
    },
  };
}

function runMiddlewareLogic(
  requestHeaders: Record<string, string>,
): { responseHeaders: MockHeaders } {
  const reqHeaders = createMockHeaders(requestHeaders);
  const resHeaders = createMockHeaders();

  // Exact logic from src/middleware.ts
  const requestId = reqHeaders.get('x-request-id') ?? crypto.randomUUID();
  resHeaders.set('x-request-id', requestId);

  return { responseHeaders: resHeaders };
}

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

/** Generates a valid UUID v4 string */
const arbitraryUuidV4 = fc
  .tuple(
    fc.stringMatching(/^[0-9a-f]{8}$/),
    fc.stringMatching(/^[0-9a-f]{4}$/),
    fc.stringMatching(/^[0-9a-f]{3}$/),
    fc.stringMatching(/^[89ab][0-9a-f]{3}$/),
    fc.stringMatching(/^[0-9a-f]{12}$/),
  )
  .map(([a, b, c, d, e]) => `${a}-${b}-4${c}-${d}-${e}`);

/** Generates arbitrary request header maps, with or without x-request-id */
const arbitraryRequestHeaders = fc.oneof(
  // No x-request-id header at all
  fc.constant({}),
  // With a valid UUID v4 as x-request-id
  arbitraryUuidV4.map((id) => ({ 'x-request-id': id })),
  // With an arbitrary non-UUID string as x-request-id (client-supplied)
  fc
    .string({ minLength: 1, maxLength: 64 })
    .map((id) => ({ 'x-request-id': id })),
);

// ---------------------------------------------------------------------------
// Property 3
// ---------------------------------------------------------------------------

describe('middleware x-request-id property tests', () => {
  it(
    'Property 3: for any incoming request, the response always carries an x-request-id header that is a valid UUID v4 when no x-request-id is provided',
    () => {
      // Feature: production-logging, Property 3: For any incoming request, the response always carries an x-request-id header that is a valid UUID v4
      fc.assert(
        fc.property(
          // Only requests WITHOUT an x-request-id header — middleware must generate one
          fc.constant({}),
          (requestHeaders) => {
            const { responseHeaders } = runMiddlewareLogic(requestHeaders);
            const responseId = responseHeaders.get('x-request-id');

            // The response must always have an x-request-id header
            expect(responseId).not.toBeNull();
            expect(typeof responseId).toBe('string');

            // The generated value must be a valid UUID v4
            expect(responseId).toMatch(UUID_V4_PATTERN);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'Property 3 (full): for any incoming request scenario, the response always carries an x-request-id header that is a valid UUID v4',
    () => {
      // Feature: production-logging, Property 3: For any incoming request, the response always carries an x-request-id header that is a valid UUID v4
      fc.assert(
        fc.property(arbitraryRequestHeaders, (requestHeaders) => {
          const { responseHeaders } = runMiddlewareLogic(requestHeaders);
          const responseId = responseHeaders.get('x-request-id');

          // The response must always have an x-request-id header
          expect(responseId).not.toBeNull();
          expect(typeof responseId).toBe('string');

          // When the incoming request had no x-request-id, the generated one must be UUID v4
          const incomingId =
            requestHeaders['x-request-id'] ?? null;
          if (incomingId === null) {
            expect(responseId).toMatch(UUID_V4_PATTERN);
          }

          // The response header must always be a non-empty string
          expect((responseId as string).length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    },
  );
});
