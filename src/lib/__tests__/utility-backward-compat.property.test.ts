import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Type } from '@prisma/client';

/**
 * Property-based tests for utility function backward compatibility
 * Validates: Requirements 5.3
 */

// Feature: production-logging, Property 9: When a utility function is called without a wideEvent, the return value is identical to calling it with wideEvent provided (no side effects on return value)

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  default: {
    event: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: unknown) => fn,
  };
});

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import prisma from '@/lib/prisma';
import { getEvents } from '@/utils/getEvents';
import { getEventsCount } from '@/utils/getEventsCount';
import { getAdminEvents } from '@/utils/getAdminEvents';
import { getAdminSearchedEvents } from '@/utils/getAdminSearchedEvents';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const eventTypeArb = fc.constantFrom<Type>('OUVERT', 'BAPTISE', 'AUTRE');

const pageArb = fc.integer({ min: 1, max: 100 }).map(String);

const searchArb = fc.string({ minLength: 0, maxLength: 50 });

const eventResultArb = fc.array(
  fc.record({
    id: fc.integer({ min: 1 }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    date: fc.constant(new Date('2024-01-01T00:00:00.000Z')),
    pinned: fc.boolean(),
    coverName: fc.string(),
    coverUrl: fc.string(),
    coverWidth: fc.integer({ min: 100, max: 2000 }),
    coverHeight: fc.integer({ min: 100, max: 2000 }),
  }),
  { maxLength: 20 },
);

// ---------------------------------------------------------------------------
// Property 9: return value is identical with or without wideEvent
// ---------------------------------------------------------------------------

describe('Property 9: When a utility function is called without a wideEvent, the return value is identical to calling it with wideEvent provided (no side effects on return value)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'getEvents: return value is identical with and without wideEvent',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          pageArb,
          fc.integer({ min: 1, max: 50 }),
          eventTypeArb,
          eventResultArb,
          async (page, eventPerPage, type, mockResults) => {
            // Same mock results for both calls
            vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
            const withoutWideEvent = await getEvents(page, eventPerPage, type);

            vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
            const wideEvent: Record<string, unknown> = {};
            const withWideEvent = await getEvents(page, eventPerPage, type, wideEvent);

            expect(withoutWideEvent).toEqual(withWideEvent);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getEventsCount: return value is identical with and without wideEvent',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          eventTypeArb,
          fc.integer({ min: 0, max: 10000 }),
          async (type, mockCount) => {
            vi.mocked(prisma.event.count).mockResolvedValue(mockCount);
            const withoutWideEvent = await getEventsCount(type);

            vi.mocked(prisma.event.count).mockResolvedValue(mockCount);
            const wideEvent: Record<string, unknown> = {};
            const withWideEvent = await getEventsCount(type, wideEvent);

            expect(withoutWideEvent).toEqual(withWideEvent);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getAdminEvents: return value is identical with and without wideEvent',
    async () => {
      await fc.assert(
        fc.asyncProperty(eventResultArb, async (mockResults) => {
          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
          const withoutWideEvent = await getAdminEvents();

          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
          const wideEvent: Record<string, unknown> = {};
          const withWideEvent = await getAdminEvents(wideEvent);

          expect(withoutWideEvent).toEqual(withWideEvent);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getAdminSearchedEvents: return value is identical with and without wideEvent',
    async () => {
      await fc.assert(
        fc.asyncProperty(searchArb, eventResultArb, async (search, mockResults) => {
          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
          const withoutWideEvent = await getAdminSearchedEvents(search);

          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);
          const wideEvent: Record<string, unknown> = {};
          const withWideEvent = await getAdminSearchedEvents(search, wideEvent);

          expect(withoutWideEvent).toEqual(withWideEvent);
        }),
        { numRuns: 100 },
      );
    },
  );
});
