import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAutreEventPassword = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
      type: "AUTRE",
      published: true,
    },
    select: {
      password: true,
    },
  });
  return res;
});
