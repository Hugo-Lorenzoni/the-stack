import prisma from "@/lib/prisma";
import { Type } from "@prisma/client";
import { cache } from "react";

export const getEventsCount = cache(
  async (type: Type, wideEvent?: Record<string, unknown>) => {
    const start = Date.now();
    const res = await prisma.event.count({
      where: {
        type: type,
        published: true,
      },
    });
    if (wideEvent) {
      wideEvent.get_events_count = {
        duration_ms: Date.now() - start,
        count: res,
        type,
      };
    }
    return res;
  },
);
