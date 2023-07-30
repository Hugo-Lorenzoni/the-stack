import prisma from "@/lib/prisma";
import { Type } from "@prisma/client";
import { cache } from "react";

export const getEventsCount = cache(async (type: Type) => {
  const res = await prisma.event.count({
    where: {
      type: type,
      published: true,
    },
  });
  return res;
});
