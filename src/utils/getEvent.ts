import minioClient from "@/lib/minio";
import prisma from "@/lib/prisma";
import { cache } from "react";

export const getEvent = cache(async (id: string) => {
  const res = await prisma.event.findUnique({
    where: {
      id: id,
      type: "OUVERT",
      published: true,
    },
    select: {
      id: true,
      title: true,
      date: true,
      type: true,
      notes: true,
      pinned: true,
      coverName: true,
      coverUrl: true,
      coverWidth: true,
      coverHeight: true,
      photos: true,
      sponsors: true,
    },
  });
  // if (!res) {
  //   return null;
  // }
  // const url = res.photos.map((photo) => photo.url.substring(1));
  // const presignedUrls = await minioClient.presignedGetObject(
  //   "cpv",
  //   url,
  //   24 * 60 * 60,
  // );
  // console.log(presignedUrls);

  // res.photos = await Promise.all(
  //   res.photos.map(async (photo) => {
  //     const url = photo.url.substring(1);
  //     const presignedUrl = await minioClient.presignedGetObject(
  //       "cpv",
  //       url,
  //       12 * 60 * 60,
  //     );
  //     // console.log(presignedUrl);

  //     return {
  //       ...photo,
  //       url: presignedUrl,
  //     };
  //   }),
  // );

  // res.photos = await Promise.all(
  //   res.photos.map(async (photo) => {
  //     const url = photo.url.substring(1);
  //     const presignedUrl = await minioClient.presignedUrl(
  //       "GET",
  //       "cpv",
  //       url,
  //       24 * 60 * 60,
  //     );
  //     // console.log(presignedUrl);

  //     return {
  //       ...photo,
  //       url: presignedUrl,
  //     };
  //   }),
  // );
  // console.log(res);

  return res;
});
