import prisma from "@/lib/prisma";
import { cache } from "react";

export const getAllUsers = cache(async () => {
  const res = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      surname: true,
      role: true,
      cercle: true,
      autreCercle: true,
      createdAt: true,
    },
  });
  return res;
});
