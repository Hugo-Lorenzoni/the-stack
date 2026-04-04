import sizeOf from "image-size";

import { saveFile } from "@/lib/files";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const valuesSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(TypeList),
  title: z.string(),
  date: z.string(),
});

export const POST = withLogging(async (req: NextRequest, { wideEvent }) => {
  const data = await req.formData();

  const values = data.get("values") as string;
  if (!values) {
    return NextResponse.json({ message: "No values" }, { status: 500 });
  }

  const result = valuesSchema.safeParse(JSON.parse(values));

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const currentEvent = result.data;

  wideEvent.action = "add_photo";
  wideEvent.event_id = currentEvent.id;

  const photoFile = data.get("file") as File;

  const photoURL = await saveFile(
    photoFile,
    currentEvent.title,
    new Date(currentEvent.date),
    currentEvent.type,
    false,
  );

  const photoArray = await photoFile.arrayBuffer();
  const photoDismensions = sizeOf(Buffer.from(photoArray));

  const photo = {
    name: photoFile.name,
    url: photoURL,
    width: photoDismensions.width,
    height: photoDismensions.height,
  };

  const parsedPhoto = photoSchema.parse(photo);
  if (!parsedPhoto) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  const event = await prisma.event.update({
    where: { id: currentEvent.id },
    data: {
      photos: {
        create: {
          ...parsedPhoto,
        },
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { event: event, photo: parsedPhoto },
    { status: 200 },
  );
});
