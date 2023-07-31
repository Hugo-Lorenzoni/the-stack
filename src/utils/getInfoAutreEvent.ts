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
  return res;
});
