import prisma from "@/lib/prisma";
import { cache } from "react";

export const getInfos = cache(async () => {
  const countEventOuvert = await prisma.event.count({
    where: {
      type: "OUVERT",
    },
  });
  const countEventFpms = await prisma.event.count({
    where: {
      type: "BAPTISE",
    },
  });
  const countEventAutre = await prisma.event.count({
    where: {
      type: "AUTRE",
    },
  });
  const countUser = await prisma.user.count();
  const countWaitingUser = await prisma.user.count({
    where: {
      role: "WAITING",
    },
  });
  const countPhoto = await prisma.photo.count();
  const countVideo = await prisma.video.count();

  const res = {
    countEventOuvert,
    countEventFpms,
    countEventAutre,
    countUser,
    countWaitingUser,
    countPhoto,
    countVideo,
  };
  return res;
});
