import sizeOf from "image-size";

import { saveFile } from "@/lib/files";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";
import * as z from "zod";

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
const photosSchema = z.array(photoSchema).nonempty();

const idSchema = z.string().min(1);

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "add_photos";

  const data = await req.formData();

  const values = data.get("id") as string;
  if (!values) {
    return NextResponse.json({ message: "No values" }, { status: 500 });
  }
  const id = JSON.parse(values);
  const result = idSchema.safeParse(id);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const currentEvent = await prisma.event.findUnique({
    where: { id: result.data },
    select: {
      title: true,
      date: true,
      type: true,
    },
  });
  if (!currentEvent) {
    return NextResponse.json(
      { error: "Could not find the event" },
      { status: 500 },
    );
  }

  const photosFiles = data.getAll("file") as Array<File>;
  const photos = await Promise.all(
    photosFiles.map(async (photo) => {
      const photoURL = await saveFile(
        photo,
        currentEvent.title,
        currentEvent.date,
        currentEvent.type,
        false,
      );
      const photoArray = await photo.arrayBuffer();
      const photoDismensions = sizeOf(Buffer.from(photoArray));
      return {
        name: photo.name,
        url: photoURL,
        width: photoDismensions.width,
        height: photoDismensions.height,
      };
    }),
  );
  const parsedPhotos = photosSchema.parse(photos);
  if (!parsedPhotos) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
  const event = await prisma.event.update({
    where: { id: result.data },
    data: {
      photos: {
        createMany: {
          data: parsedPhotos,
        },
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
      photos: { orderBy: { name: "asc" } },
    },
  });
  if (!event) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  wideEvent.photo_count = parsedPhotos.length;

  return NextResponse.json({ event: event }, { status: 200 });
});
