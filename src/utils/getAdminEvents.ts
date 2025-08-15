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
    orderBy: [{ publishedAt: "desc" }],
  });
  // Add 12 hours to each event's date
  res.forEach((event) => {
    event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
  });

  return res;
});
