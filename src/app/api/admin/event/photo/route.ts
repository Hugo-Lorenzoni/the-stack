import sizeOf from "image-size";

import { saveFile } from "@/lib/files";
import { getDirectoryPath, getFileName } from "@/lib/path";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { postHogServerClient } from "@/lib/posthog";
import { stat } from "fs/promises";
import { join } from "path";
import { env } from "process";

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
      postHogServerClient.captureException(
        new Error("No values provided in the request"),
      );
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }

    const result = valuesSchema.safeParse(JSON.parse(values));

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const currentEvent = result.data;

    const photoFile = data.get("file") as File;

    const relativeUploadDir = getDirectoryPath(
      currentEvent.type,
      new Date(currentEvent.date),
      currentEvent.title,
    );
    const filename = getFileName(photoFile, false);
    const relativePhotoUrl = `${relativeUploadDir}/${filename}`;

    const existingPhoto = await prisma.photo.findFirst({
      where: { url: relativePhotoUrl },
      select: { id: true },
    });
    if (existingPhoto) {
      postHogServerClient.captureException(
        new Error(`Photo already exists in db: ${relativePhotoUrl}`),
      );
      return NextResponse.json(
        { error: "Photo already exists" },
        { status: 409 },
      );
    }

    const photoPath = join(env.DATA_FOLDER, "photos", relativePhotoUrl);
    try {
      await stat(photoPath);
      postHogServerClient.captureException(
        new Error(`Photo already exists on disk: ${photoPath}`),
      );
      return NextResponse.json(
        { error: "Photo already exists" },
        { status: 409 },
      );
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        postHogServerClient.captureException(error);
        return NextResponse.json(
          { error: "Something went wrong." },
          { status: 500 },
        );
      }
    }

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
      postHogServerClient.captureException(
        new Error("Failed parsing the photo"),
      );
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
      postHogServerClient.captureException(
        new Error(`${photo.name} - db query failed`),
      );
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
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
