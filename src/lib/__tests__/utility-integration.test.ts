import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Type } from '@prisma/client';

/**
 * Unit tests for utility function wideEvent integration
 * Requirements: 5.1, 5.2, 5.3
 */

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  default: {
    event: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    user: { count: vi.fn() },
    photo: { count: vi.fn() },
    video: { count: vi.fn() },
  },
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, cache: (fn: unknown) => fn };
});

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('next/server', () => ({
  after: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn() },
}));

vi.mock('@/lib/folder-size', () => ({
  getFolderSizeOptimized: vi.fn().mockResolvedValue(0),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import prisma from '@/lib/prisma';
import { getEvents } from '@/utils/getEvents';
import { getEventsCount } from '@/utils/getEventsCount';
import { getInfos } from '@/utils/getInfos';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockEvents = [
  {
    id: 1,
    title: 'Event A',
    date: new Date('2024-01-01T12:00:00.000Z'),
    pinned: false,
    coverName: 'cover.jpg',
    coverUrl: 'https://example.com/cover.jpg',
    coverWidth: 800,
    coverHeight: 600,
  },
  {
    id: 2,
    title: 'Event B',
    date: new Date('2024-02-01T12:00:00.000Z'),
    pinned: true,
    coverName: 'cover2.jpg',
    coverUrl: 'https://example.com/cover2.jpg',
    coverWidth: 1024,
    coverHeight: 768,
  },
];

const mockInfos = {
  timestamp: Date.now(),
  userCount: 10,
  waitingUserCount: 2,
  photoCount: 50,
  eventOuvertCount: 5,
  eventFpmsCount: 3,
  eventAutreCount: 2,
  totalCount: 10,
  videoCount: 4,
  storageUsed: 1.5,
};

// ---------------------------------------------------------------------------
// getEvents
// ---------------------------------------------------------------------------

describe('getEvents wideEvent integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.event.findMany).mockResolvedValue(mockEvents as never);
  });

  it('writes wideEvent.get_events sub-object with duration_ms, count, page, type when wideEvent is provided', async () => {
    const wideEvent: Record<string, unknown> = {};
    await getEvents('2', 10, 'OUVERT' as Type, wideEvent);

    const sub = wideEvent.get_events as Record<string, unknown>;
    expect(sub).toBeDefined();
    expect(typeof sub.duration_ms).toBe('number');
    expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
    expect(sub.count).toBe(mockEvents.length);
    expect(sub.page).toBe(2);
    expect(sub.type).toBe('OUVERT');
  });

  it('does not mutate wideEvent when wideEvent is not provided', async () => {
    // Should not throw and should return results normally
    const result = await getEvents('1', 10, 'OUVERT' as Type);
    expect(result).toBeDefined();
    expect(result.length).toBe(mockEvents.length);
  });

  it('count reflects the actual number of results returned', async () => {
    vi.mocked(prisma.event.findMany).mockResolvedValue([mockEvents[0]] as never);
    const wideEvent: Record<string, unknown> = {};
    await getEvents('1', 10, 'BAPTISE' as Type, wideEvent);

    const sub = wideEvent.get_events as Record<string, unknown>;
    expect(sub.count).toBe(1);
  });

  it('page is stored as a number even though the parameter is a string', async () => {
    const wideEvent: Record<string, unknown> = {};
    await getEvents('3', 10, 'AUTRE' as Type, wideEvent);

    const sub = wideEvent.get_events as Record<string, unknown>;
    expect(sub.page).toBe(3);
    expect(typeof sub.page).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// getEventsCount
// ---------------------------------------------------------------------------

describe('getEventsCount wideEvent integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.event.count).mockResolvedValue(42);
  });

  it('writes wideEvent.get_events_count sub-object with duration_ms, count, type when wideEvent is provided', async () => {
    const wideEvent: Record<string, unknown> = {};
    await getEventsCount('OUVERT' as Type, wideEvent);

    const sub = wideEvent.get_events_count as Record<string, unknown>;
    expect(sub).toBeDefined();
    expect(typeof sub.duration_ms).toBe('number');
    expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
    expect(sub.count).toBe(42);
    expect(sub.type).toBe('OUVERT');
  });

  it('does not mutate wideEvent when wideEvent is not provided', async () => {
    const result = await getEventsCount('BAPTISE' as Type);
    expect(result).toBe(42);
  });

  it('count reflects the prisma result', async () => {
    vi.mocked(prisma.event.count).mockResolvedValue(0);
    const wideEvent: Record<string, unknown> = {};
    await getEventsCount('AUTRE' as Type, wideEvent);

    const sub = wideEvent.get_events_count as Record<string, unknown>;
    expect(sub.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getInfos
// ---------------------------------------------------------------------------

describe('getInfos wideEvent integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATA_FOLDER = '/tmp/test-data';
    // Simulate cache file exists and is fresh
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockInfos) as never);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('writes wideEvent.get_infos sub-object with duration_ms and cache_hit when wideEvent is provided (cache hit)', async () => {
    const wideEvent: Record<string, unknown> = {};
    await getInfos(wideEvent);

    const sub = wideEvent.get_infos as Record<string, unknown>;
    expect(sub).toBeDefined();
    expect(typeof sub.duration_ms).toBe('number');
    expect(sub.duration_ms as number).toBeGreaterThanOrEqual(0);
    expect(sub.cache_hit).toBe(true);
  });

  it('writes cache_hit: false when cache file does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    // Simulate DB calls for fetchInfos
    vi.mocked(prisma.event.groupBy).mockResolvedValue([] as never);
    vi.mocked(prisma.user.count).mockResolvedValue(0);
    vi.mocked(prisma.photo.count).mockResolvedValue(0);
    vi.mocked(prisma.video.count).mockResolvedValue(0);

    const wideEvent: Record<string, unknown> = {};
    await getInfos(wideEvent);

    const sub = wideEvent.get_infos as Record<string, unknown>;
    expect(sub).toBeDefined();
    expect(sub.cache_hit).toBe(false);
  });

  it('does not mutate wideEvent when wideEvent is not provided', async () => {
    // Should not throw and should return infos normally
    const result = await getInfos();
    expect(result).toBeDefined();
    expect(result.userCount).toBe(mockInfos.userCount);
  });
});
