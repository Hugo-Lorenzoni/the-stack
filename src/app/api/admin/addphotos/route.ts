import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import * as z from "zod";
import { saveFileS3 } from "@/utils/saveFileS3";

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
const photosSchema = z.array(photoSchema).nonempty();

const idSchema = z.string().min(1);

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("id") as string;
    if (!values) {
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }
    const id = JSON.parse(values);
    // console.log(id);
    const result = idSchema.safeParse(id);

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    // console.log(result.data);

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

    const dateFormat = new Date(currentEvent.date);
    // console.log(dateFormat);

    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);

    const photosFiles = data.getAll("file") as Array<File>;
    const photos = await Promise.all(
      photosFiles.map(async (photo) => {
        const photoURL = await saveFileS3(
          photo,
          currentEvent.title,
          dateString,
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
        photos: true,
      },
    });
    if (!event) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    return NextResponse.json({ event: event }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
