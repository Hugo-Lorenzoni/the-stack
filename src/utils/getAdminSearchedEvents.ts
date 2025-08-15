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
  // Add 12 hours to each event's date
  results.forEach((event) => {
    event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
  });
  return results;
});
