import prisma from "@/lib/prisma";
import { cache } from "react";
import getFolderSize from "get-folder-size";
import { env } from "process";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { after } from "next/server";
import {
  getFolderSizeFast,
  getFolderSizeNode,
  getFolderSizeOptimized,
  getFolderSizeStream,
} from "@/lib/folder-size";

// const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const CACHE_DURATION = 1000 * 10; // 10 seconds (for testing)

async function timedPromise<T>(promise: Promise<T>, label: string): Promise<T> {
  const start = Date.now();
  const result = await promise;
  console.log(`[TIMER] ${label} took ${Date.now() - start}ms`);
  return result;
}

async function fetchInfos() {
  const time = Date.now();
  const [
    _storageUsed,
    eventCounts,
    userCount,
    waitingUserCount,
    photoCount,
    videoCount,
  ] = await Promise.all([
    timedPromise(
      getFolderSizeFast(join(env.DATA_FOLDER, "photos")),
      "storageUsed",
    ),
    timedPromise(
      prisma.event.groupBy({
        by: ["type"],
        _count: { id: true },
        where: { type: { in: ["OUVERT", "BAPTISE", "AUTRE"] } },
      }),
      "eventCounts",
    ),
    timedPromise(prisma.user.count(), "userCount"),
    timedPromise(
      prisma.user.count({ where: { role: "WAITING" } }),
      "waitingUserCount",
    ),
    timedPromise(prisma.photo.count(), "photoCount"),
    timedPromise(prisma.video.count(), "videoCount"),
  ]);

  // const size = await getFolderSize.strict(folder);
  const storageUsed = Number((_storageUsed / 1000 / 1000 / 1000).toFixed(2));

  const eventOuvertCount =
    eventCounts.find((e) => e.type === "OUVERT")?._count.id || 0;
  const eventFpmsCount =
    eventCounts.find((e) => e.type === "BAPTISE")?._count.id || 0;
  const eventAutreCount =
    eventCounts.find((e) => e.type === "AUTRE")?._count.id || 0;

  const totalCount = eventOuvertCount + eventFpmsCount + eventAutreCount;

  console.log(`[INFO] Fetched infos in ${Date.now() - time}ms`);

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

export const getInfos = cache(async () => {
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

  if (!existsSync(path)) {
    const infos = await fetchInfos();

    // Write the data to a JSON file
    await writeFile(
      join(env.DATA_FOLDER, "json", "infos.json"),
      JSON.stringify(infos),
    );
  } else {
    infos = JSON.parse(await readFile(path, "utf-8"));

    if (
      infos.timestamp === undefined ||
      now - infos.timestamp > CACHE_DURATION
    ) {
      after(async () => {
        console.log("[INFO] Refreshing infos.json data...");
        const infos = await fetchInfos();

        // Write the data to a JSON file
        await writeFile(
          join(env.DATA_FOLDER, "json", "infos.json"),
          JSON.stringify(infos),
        );
      });
    }
  }

  return infos;
});
