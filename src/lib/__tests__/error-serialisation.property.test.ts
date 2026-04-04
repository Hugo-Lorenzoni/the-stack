import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { NextRequest, NextResponse } from "next/server";

/**
 * Property-based tests for error field serialisation in wide events
 * Validates: Requirements 3.6, 6.5, 6.7, 9.4
 */

// Feature: production-logging, Property 13: When wideEvent.error is set, it is always a plain object { message: string, type: string } and never a raw Error instance or undefined

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/auth", () => ({
  getNextAuthSession: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { withLogging } from "../withLogging";
import { logger } from "@/lib/logger";
import { getNextAuthSession } from "@/utils/auth";

// Helper: get the wide event from whichever log level was called
function getLoggedWideEvent(): Record<string, unknown> {
  const infoCalls = vi.mocked(logger.info).mock.calls;
  const errorCalls = vi.mocked(logger.error).mock.calls;
  const call = infoCalls[0] ?? errorCalls[0];
  return call[0] as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates an arbitrary Error instance with a random message */
const errorInstanceArb = fc
  .string({ minLength: 0, maxLength: 200 })
  .map((msg) => new Error(msg));

/** Generates an arbitrary named Error subclass instance */
const namedErrorArb = fc
  .tuple(
    fc.constantFrom(
      "TypeError",
      "RangeError",
      "ReferenceError",
      "SyntaxError",
      "URIError",
      "EvalError",
    ),
    fc.string({ minLength: 0, maxLength: 200 }),
  )
  .map(([name, msg]) => {
    const constructors: Record<string, new (msg: string) => Error> = {
      TypeError,
      RangeError,
      ReferenceError,
      SyntaxError,
      URIError,
      EvalError,
    };
    return new constructors[name](msg);
  });

/** Generates a thrown string value */
const thrownStringArb = fc.string({ minLength: 0, maxLength: 200 });

/** Generates a thrown number value */
const thrownNumberArb = fc.float({ noNaN: true });

/** Generates a thrown plain object */
const thrownObjectArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.string(),
);

/** Generates null as a thrown value */
const thrownNullArb = fc.constant(null);

/** Generates undefined as a thrown value */
const thrownUndefinedArb = fc.constant(undefined);

/** Union of all throwable values */
const anyThrowableArb: fc.Arbitrary<unknown> = fc.oneof(
  errorInstanceArb,
  namedErrorArb,
  thrownStringArb,
  thrownNumberArb,
  thrownObjectArb,
  thrownNullArb,
  thrownUndefinedArb,
);

// ---------------------------------------------------------------------------
// Property 13: wideEvent.error is always a plain { message: string, type: string }
// ---------------------------------------------------------------------------

describe("Property 13: When wideEvent.error is set, it is always a plain object { message: string, type: string } and never a raw Error instance or undefined", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNextAuthSession).mockResolvedValue(null);
  });

  it("withLogging: wideEvent.error is never a raw Error instance when handler throws any Error", async () => {
    await fc.assert(
      fc.asyncProperty(errorInstanceArb, async (thrownError) => {
        vi.clearAllMocks();
        vi.mocked(getNextAuthSession).mockResolvedValue(null);

        const handler = withLogging(async () => {
          throw thrownError;
        });
        const req = new NextRequest("http://localhost/api/test", {
          method: "GET",
        });

        await expect(
          handler(req, { params: Promise.resolve({}), wideEvent: {} }),
        ).rejects.toThrow();

        const wideEvent = getLoggedWideEvent();

        expect(wideEvent.error).toBeDefined();
        expect(wideEvent.error).not.toBeUndefined();
        expect(wideEvent.error instanceof Error).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("withLogging: wideEvent.error.message is always a string when handler throws any Error", async () => {
    await fc.assert(
      fc.asyncProperty(errorInstanceArb, async (thrownError) => {
        vi.clearAllMocks();
        vi.mocked(getNextAuthSession).mockResolvedValue(null);

        const handler = withLogging(async () => {
          throw thrownError;
        });
        const req = new NextRequest("http://localhost/api/test", {
          method: "GET",
        });

        await expect(
          handler(req, { params: Promise.resolve({}), wideEvent: {} }),
        ).rejects.toThrow();

        const wideEvent = getLoggedWideEvent();
        const error = wideEvent.error as Record<string, unknown>;

        expect(typeof error.message).toBe("string");
      }),
      { numRuns: 100 },
    );
  });

  it("withLogging: wideEvent.error.type is always a string when handler throws any Error", async () => {
    await fc.assert(
      fc.asyncProperty(errorInstanceArb, async (thrownError) => {
        vi.clearAllMocks();
        vi.mocked(getNextAuthSession).mockResolvedValue(null);

        const handler = withLogging(async () => {
          throw thrownError;
        });
        const req = new NextRequest("http://localhost/api/test", {
          method: "GET",
        });

        await expect(
          handler(req, { params: Promise.resolve({}), wideEvent: {} }),
        ).rejects.toThrow();

        const wideEvent = getLoggedWideEvent();
        const error = wideEvent.error as Record<string, unknown>;

        expect(typeof error.type).toBe("string");
      }),
      { numRuns: 100 },
    );
  });

  it("withLogging: wideEvent.error is a plain object with exactly { message, type } when handler throws a named Error subclass", async () => {
    await fc.assert(
      fc.asyncProperty(namedErrorArb, async (thrownError) => {
        vi.clearAllMocks();
        vi.mocked(getNextAuthSession).mockResolvedValue(null);

        const handler = withLogging(async () => {
          throw thrownError;
        });
        const req = new NextRequest("http://localhost/api/test", {
          method: "GET",
        });

        await expect(
          handler(req, { params: Promise.resolve({}), wideEvent: {} }),
        ).rejects.toThrow();

        const wideEvent = getLoggedWideEvent();
        const error = wideEvent.error as Record<string, unknown>;

        expect(error instanceof Error).toBe(false);
        expect(typeof error.message).toBe("string");
        expect(typeof error.type).toBe("string");
        // type should reflect the actual error name
        expect(error.type).toBe(thrownError.name);
        // message should match the original error message
        expect(error.message).toBe(thrownError.message);
      }),
      { numRuns: 100 },
    );
  });

  it("withLogging: wideEvent.error is always a plain { message: string, type: string } for any thrown value", async () => {
    await fc.assert(
      fc.asyncProperty(anyThrowableArb, async (thrownValue) => {
        vi.clearAllMocks();
        vi.mocked(getNextAuthSession).mockResolvedValue(null);

        const handler = withLogging(async () => {
          // eslint-disable-next-line no-throw-literal
          throw thrownValue;
        });
        const req = new NextRequest("http://localhost/api/test", {
          method: "GET",
        });

        await expect(
          handler(req, { params: Promise.resolve({}), wideEvent: {} }),
        ).rejects.toThrow();

        const wideEvent = getLoggedWideEvent();

        // error must be defined and not undefined
        expect(wideEvent.error).toBeDefined();
        expect(wideEvent.error).not.toBeUndefined();

        // error must never be a raw Error instance
        expect(wideEvent.error instanceof Error).toBe(false);

        // error must be a plain object
        expect(typeof wideEvent.error).toBe("object");
        expect(wideEvent.error).not.toBeNull();

        const error = wideEvent.error as Record<string, unknown>;

        // message must always be a string
        expect(typeof error.message).toBe("string");

        // type must always be a string
        expect(typeof error.type).toBe("string");
      }),
      { numRuns: 100 },
    );
  });

  it("withLogging: wideEvent.error is not set (undefined) when handler succeeds", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(200, 201, 400, 404),
        async (statusCode) => {
          vi.clearAllMocks();
          vi.mocked(getNextAuthSession).mockResolvedValue(null);

          const handler = withLogging(async () =>
            NextResponse.json({}, { status: statusCode }),
          );
          const req = new NextRequest("http://localhost/api/test", {
            method: "GET",
          });

          await handler(req, { params: Promise.resolve({}), wideEvent: {} });

          const wideEvent = getLoggedWideEvent();

          // When no error occurs, wideEvent.error should not be set
          expect(wideEvent.error).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });
});
