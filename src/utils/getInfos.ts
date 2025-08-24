import prisma from "@/lib/prisma";
import { cache } from "react";
import getFolderSize from "get-folder-size";
import { env } from "process";
import { join } from "path";

export const getInfos = cache(async () => {
  const [
    eventCounts,
    // countEventOuvert,
    // countEventFpms,
    // countEventAutre,
    countUser,
    countWaitingUser,
    countPhoto,
    countVideo,
    // size,
  ] = await Promise.all([
    prisma.event.groupBy({
      by: ["type"],
      _count: { id: true },
      where: { type: { in: ["OUVERT", "BAPTISE", "AUTRE"] } },
    }),
    // prisma.event.count({ where: { type: "OUVERT" } }),
    // prisma.event.count({ where: { type: "BAPTISE" } }),
    // prisma.event.count({ where: { type: "AUTRE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "WAITING" } }),
    prisma.photo.count(),
    prisma.video.count(),
    // getFolderSize.loose(join(env.DATA_FOLDER, "photos")),
  ]);

  // const size = await getFolderSize.strict(folder);
  // const formatedSize = Number((size / 1000 / 1000 / 1000).toFixed(2));
  const countEventOuvert =
    eventCounts.find((e) => e.type === "OUVERT")?._count.id || 0;
  const countEventFpms =
    eventCounts.find((e) => e.type === "BAPTISE")?._count.id || 0;
  const countEventAutre =
    eventCounts.find((e) => e.type === "AUTRE")?._count.id || 0;

  const res = {
    countEventOuvert,
    countEventFpms,
    countEventAutre,
    countUser,
    countWaitingUser,
    countPhoto,
    countVideo,
    // formatedSize,
  };
  return res;
});
