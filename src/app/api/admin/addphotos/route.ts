import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, stat, writeFile } from "fs/promises";
import { Type } from "@prisma/client";
import { join } from "path";
import mime from "mime";
import * as z from "zod";

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

    const photosFiles = data.getAll("file") as Array<File>;
    const photos = await Promise.all(
      photosFiles.map(async (photo) => {
        const photoURL = await saveFile(
          photo,
          currentEvent.title,
          currentEvent.date.toISOString(),
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
    return NextResponse.json({ event: event }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

const saveFile = async (
  file: File,
  title: string,
  date: string,
  type: Type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);
  const relativeUploadDir = `/${type}/${date.substring(0, 10)}-${title
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ê/g, "e")
    .replace(/à/g, "a")
    .replace(/â/g, "a")}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(
        "Error while trying to create directory when uploading a file\n",
        e,
      );
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
  }
  try {
    const filename = `${cover ? "cover-" : ""}${file.name.replace(
      /\.[^/.]+$/,
      "",
    )}.${mime.getExtension(file.type)}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    return `${relativeUploadDir}/${filename}`;
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
};
