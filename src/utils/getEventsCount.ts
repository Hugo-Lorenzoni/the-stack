import prisma from "@/lib/prisma";
import { Event_type } from "@prisma/client";
import { cache } from "react";

export const getEventsCount = cache(async (type: Event_type) => {
  const res = await prisma.event.count({
    where: {
      type: type,
      published: true,
    },
  });
  return res;
});
