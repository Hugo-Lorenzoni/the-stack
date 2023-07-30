import prisma from "@/lib/prisma";
import { cache } from "react";

export const getWaitingUsers = cache(async () => {
  const res = await prisma.user.findMany({
    where: {
      role: "WAITING",
    },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      cercle: true,
      autreCercle: true,
      cercleVille: true,
      promo: true,
    },
  });
  return res;
});
