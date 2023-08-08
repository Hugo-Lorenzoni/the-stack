import prisma from "@/lib/prisma";
import { cache } from "react";

export const getVideos = cache(async () => {
  const res = await prisma.video.findMany({
    orderBy: [{ date: "desc" }],
  });
  return res;
});
