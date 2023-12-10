import prisma from "@/lib/prisma";
import { Type } from "@prisma/client";
import { cache } from "react";

export const getEvents = cache(
  async (page: string, eventPerPage: number, type: Type) => {
    const res = await prisma.event.findMany({
      skip: (Number(page) - 1) * eventPerPage,
      take: eventPerPage,
      where: {
        type: type,
        published: true,
      },
      select: {
        id: true,
        title: true,
        date: true,
        pinned: true,
        coverName: true,
        coverUrl: true,
        coverWidth: true,
        coverHeight: true,
      },
      orderBy: [
        {
          pinned: "desc",
        },
        { date: "desc" },
        { publishedAt: "desc" },
      ],
    });
    return res;
  },
);
