import prisma from "@/lib/prisma";
import { cache } from "react";

export const getSponsors = cache(async () => {
  const res = await prisma.sponsor.findMany();
  return res;
});
