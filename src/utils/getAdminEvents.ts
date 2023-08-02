import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAdminEvents = cache(async () => {
  const res = await prisma.event.findMany({
    take: 8,
    select: {
      id: true,
      title: true,
      date: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
    },
    orderBy: [{ publishDate: "desc" }],
  });
  return res;
});
