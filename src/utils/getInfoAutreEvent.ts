import prisma from "@/lib/prisma";
import { cache } from "react";

export const getInfoAutreEvent = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
      type: "AUTRE",
    },
    select: {
      id: true,
      title: true,
      date: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
    },
  });
  // Add 12 hours to the event's date
  if (res) {
    res.date = new Date(res.date.getTime() + 12 * 60 * 60 * 1000);
  }
  return res;
});
