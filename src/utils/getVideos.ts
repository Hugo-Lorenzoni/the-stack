import prisma from "@/lib/prisma";
import { cache } from "react";

export const getVideos = cache(async () => {
  const res = await prisma.video.findMany({
    orderBy: [{ date: "desc" }],
  });
  // Add 12 hours to each video's date
  res.forEach((video) => {
    video.date = new Date(video.date.getTime() + 12 * 60 * 60 * 1000);
  });
  return res;
});
