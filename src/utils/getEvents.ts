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
    // Add 12 hours to each event's date
    res.forEach((event) => {
      event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
    });
    return res;
  },
);
