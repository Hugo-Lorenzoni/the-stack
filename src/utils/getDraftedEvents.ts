import prisma from "@/lib/prisma";
import { cache } from "react";

export const getDraftedEvents = cache(async () => {
  const res = await prisma.event.findMany({
    where: {
      published: false,
    },
    select: {
      id: true,
      title: true,
      date: true,
      pinned: true,
      type: true,
    },
    orderBy: [{ date: "asc" }],
  });
  return res;
});
