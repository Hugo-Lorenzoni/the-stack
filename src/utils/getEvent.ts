import prisma from "@/lib/prisma";
import { cache } from "react";

export const getEvent = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      date: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
      photos: { orderBy: { name: "asc" } },
      sponsors: true,
    },
  });
  return res;
});
