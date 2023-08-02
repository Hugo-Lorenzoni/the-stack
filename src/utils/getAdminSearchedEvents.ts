import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAdminSearchedEvents = cache(async (search: string) => {
  const results = await prisma.event.findMany({
    where: {
      title: {
        contains: search,
      },
    },
    orderBy: [{ date: "desc" }],
  });
  return results;
});
