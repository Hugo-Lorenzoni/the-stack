import prisma from "@/lib/prisma";
import { cache } from "react";

export const getEvent = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
      type: "OUVERT",
      published: true,
    },
    select: {
      id: true,
      title: true,
      date: true,
      notes: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
      photos: true,
      sponsors: true,
    },
  });
  return res;
});
