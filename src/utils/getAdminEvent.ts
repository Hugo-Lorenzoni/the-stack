import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAdminEvent = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      date: true,
      type: true,
      notes: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
      password: true,
      photos: { orderBy: { name: "asc" } },
      sponsors: true,
    },
  });
  return res;
});
