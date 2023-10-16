import prisma from "@/lib/prisma";
import { cache } from "react";
import getFolderSize from "get-folder-size";

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

  const myFolder = "public";

  const size = await getFolderSize.loose(myFolder);
  const formatedSize = Number((size / 1000 / 1000 / 1000).toFixed(2));

  const res = {
    countEventOuvert,
    countEventFpms,
    countEventAutre,
    countUser,
    countWaitingUser,
    countPhoto,
    countVideo,
    formatedSize,
  };
  return res;
});
