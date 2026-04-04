import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAdminSearchedEvents = cache(
  async (search: string, wideEvent?: Record<string, unknown>) => {
    const start = Date.now();
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

    if (wideEvent) {
      wideEvent.get_admin_searched_events = {
        duration_ms: Date.now() - start,
        count: results.length,
        search,
      };
    }

    return results;
  },
);
