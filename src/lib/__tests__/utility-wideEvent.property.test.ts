import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Type } from '@prisma/client';

/**
 * Property-based tests for utility function wideEvent mutation
 * Validates: Requirements 5.2
 */

// Feature: production-logging, Property 8: When a utility function is called with a wideEvent, it always writes a sub-object with a numeric duration_ms field >= 0

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  default: {
    event: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    photo: {
      count: vi.fn(),
    },
    video: {
      count: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({ get: vi.fn().mockReturnValue('test-cookie=abc') }),
  ),
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
// Property 8: utility functions always write a sub-object with duration_ms >= 0
// ---------------------------------------------------------------------------

describe('Property 8: When a utility function is called with a wideEvent, it always writes a sub-object with a numeric duration_ms field >= 0', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'getEvents: always writes wideEvent.get_events with numeric duration_ms >= 0',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          pageArb,
          fc.integer({ min: 1, max: 50 }),
          eventTypeArb,
          eventResultArb,
          async (page, eventPerPage, type, mockResults) => {
            vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);

            const wideEvent: Record<string, unknown> = {};
            await getEvents(page, eventPerPage, type, wideEvent);

            const sub = wideEvent.get_events as Record<string, unknown>;
            expect(sub).toBeDefined();
            expect(typeof sub.duration_ms).toBe('number');
            expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getEventsCount: always writes wideEvent.get_events_count with numeric duration_ms >= 0',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          eventTypeArb,
          fc.integer({ min: 0, max: 10000 }),
          async (type, mockCount) => {
            vi.mocked(prisma.event.count).mockResolvedValue(mockCount);

            const wideEvent: Record<string, unknown> = {};
            await getEventsCount(type, wideEvent);

            const sub = wideEvent.get_events_count as Record<string, unknown>;
            expect(sub).toBeDefined();
            expect(typeof sub.duration_ms).toBe('number');
            expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getAdminEvents: always writes wideEvent.get_admin_events with numeric duration_ms >= 0',
    async () => {
      await fc.assert(
        fc.asyncProperty(eventResultArb, async (mockResults) => {
          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);

          const wideEvent: Record<string, unknown> = {};
          await getAdminEvents(wideEvent);

          const sub = wideEvent.get_admin_events as Record<string, unknown>;
          expect(sub).toBeDefined();
          expect(typeof sub.duration_ms).toBe('number');
          expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    'getAdminSearchedEvents: always writes wideEvent.get_admin_searched_events with numeric duration_ms >= 0',
    async () => {
      await fc.assert(
        fc.asyncProperty(searchArb, eventResultArb, async (search, mockResults) => {
          vi.mocked(prisma.event.findMany).mockResolvedValue(mockResults as never);

          const wideEvent: Record<string, unknown> = {};
          await getAdminSearchedEvents(search, wideEvent);

          const sub = wideEvent.get_admin_searched_events as Record<string, unknown>;
          expect(sub).toBeDefined();
          expect(typeof sub.duration_ms).toBe('number');
          expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    },
  );
});
