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
      return NextResponse.json(
        { message: "Aucune valeur fournie dans la requête" },
        { status: 500 },
      );
    }

    const result = valuesSchema.safeParse(JSON.parse(values));

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Une erreur est survenue lors de l'upload de la photo." },
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
        { error: "Cette photo existe déjà pour cet événement." },
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
        {
          error:
            "Cette photo existe déjà dans la base de données pour cet événement.",
        },
        { status: 409 },
      );
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        postHogServerClient.captureException(error);
        return NextResponse.json(
          { error: "Une erreur est survenue lors de l'upload de la photo." },
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
        { error: "Une erreur est survenue lors de l'upload de la photo." },
        { status: 500 },
      );
    }
    const createdPhoto = await prisma.photo.create({
      data: {
        ...parsedPhoto,
        event: { connect: { id: currentEvent.id } },
      },
      select: {
        id: true,
        name: true,
        url: true,
        width: true,
        height: true,
        eventId: true,
      },
    });
    if (!createdPhoto) {
      postHogServerClient.captureException(
        new Error(`${photo.name} - db query failed`),
      );
      return NextResponse.json(
        { error: "Une erreur est survenue lors de l'upload de la photo." },
        { status: 500 },
      );
    }
    return NextResponse.json({ photo: createdPhoto }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload de la photo." },
      { status: 500 },
    );
  }
}
