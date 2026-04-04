import prisma from "@/lib/prisma";
import { cache } from "react";
import { env } from "process";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { after } from "next/server";
import { getFolderSizeOptimized } from "@/lib/folder-size";
import { logger } from "@/lib/logger";

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
// const CACHE_DURATION = 1000 * 10; // 10 seconds (for testing)

async function fetchInfos() {
  const [
    eventCounts,
    userCount,
    waitingUserCount,
    photoCount,
    videoCount,
    _storageUsed,
  ] = await Promise.all([
    prisma.event.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { type: { in: ["OUVERT", "BAPTISE", "AUTRE"] } },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "WAITING" } }),
    prisma.photo.count(),
    prisma.video.count(),
    getFolderSizeOptimized(join(env.DATA_FOLDER, "photos")),
  ]);

  const storageUsed = Number((_storageUsed / 1000 / 1000 / 1000).toFixed(2));

  const eventOuvertCount =
    eventCounts.find((e) => e.type === "OUVERT")?._count.id || 0;
  const eventFpmsCount =
    eventCounts.find((e) => e.type === "BAPTISE")?._count.id || 0;
  const eventAutreCount =
    eventCounts.find((e) => e.type === "AUTRE")?._count.id || 0;

  const totalCount = eventOuvertCount + eventFpmsCount + eventAutreCount;

  return {
    timestamp: Date.now(),
    userCount,
    waitingUserCount,
    photoCount,
    eventOuvertCount,
    eventFpmsCount,
    eventAutreCount,
    totalCount,
    videoCount,
    storageUsed,
  };
}

export const getInfos = cache(
  async (wideEvent?: Record<string, unknown>) => {
    const start = Date.now();
    const now = Date.now();
    const path = join(env.DATA_FOLDER, "json", "infos.json");
    let infos = {
      timestamp: 0,
      userCount: 0,
      waitingUserCount: 0,
      photoCount: 0,
      eventOuvertCount: 0,
      eventFpmsCount: 0,
      eventAutreCount: 0,
      totalCount: 0,
      videoCount: 0,
      storageUsed: 0,
    };
    let cacheHit = false;

    if (!existsSync(path)) {
      infos = await fetchInfos();

      // Write the data to a JSON file
      await writeFile(
        join(env.DATA_FOLDER, "json", "infos.json"),
        JSON.stringify(infos),
      );
    } else {
      infos = JSON.parse(await readFile(path, "utf-8"));
      cacheHit = true;

      if (
        infos.timestamp === undefined ||
        now - infos.timestamp > CACHE_DURATION
      ) {
        cacheHit = false;
        after(async () => {
          logger.info({
            action: "cache_refresh",
            resource: "infos.json",
            outcome: "started",
          });
          const refreshStart = Date.now();
          const freshInfos = await fetchInfos();

          // Write the data to a JSON file
          await writeFile(
            join(env.DATA_FOLDER, "json", "infos.json"),
            JSON.stringify(freshInfos),
          );
          logger.info({
            action: "cache_refresh",
            resource: "infos.json",
            outcome: "completed",
            duration_ms: Date.now() - refreshStart,
          });
        });
      }
    }

    if (wideEvent) {
      wideEvent.get_infos = {
        duration_ms: Date.now() - start,
        cache_hit: cacheHit,
      };
    }

    return infos;
  },
);
