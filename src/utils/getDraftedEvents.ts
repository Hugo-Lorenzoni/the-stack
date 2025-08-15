import prisma from "@/lib/prisma";

export const getDraftedEvents = async () => {
  const res = await prisma.event.findMany({
    where: {
      published: false,
    },
    select: {
      id: true,
      title: true,
      date: true,
      pinned: true,
      type: true,
    },
    orderBy: [{ date: "asc" }],
  });
  // Add 12 hours to each event's date
  res.forEach((event) => {
    event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
  });
  return res;
};
