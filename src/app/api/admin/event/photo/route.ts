import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import sizeOf from "image-size";
import { saveFileS3 } from "@/utils/saveFileS3";
import prisma from "@/lib/prisma";

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

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values") as string;
    if (!values) {
      console.log("No values");
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }

    const result = valuesSchema.safeParse(JSON.parse(values));

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const currentEvent = result.data;
    // console.log(result.data);

    const dateString = new Date(currentEvent.date)
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);

    const photoFile = data.get("file") as File;
    if (!photoFile) {
      console.log("No file");
      return NextResponse.json({ message: "No file" }, { status: 500 });
    }

    const photoURL = await saveFileS3(
      photoFile,
      currentEvent.title,
      dateString,
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
      console.log("Failed parsing the photo");
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
        // photos: { orderBy: { name: "asc" } },
      },
    });
    if (!event) {
      console.log(`${photo.name} - db query failed`);

      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { event: event, photo: parsedPhoto },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
