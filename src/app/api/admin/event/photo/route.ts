import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, stat, writeFile } from "fs/promises";
import { Type } from "@prisma/client";
import { join } from "path";
import mime from "mime";
import * as z from "zod";
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
    // if (Math.random() < 0.1) {
    //   return NextResponse.json(
    //     { error: "Something went wrong." },
    //     { status: 500 },
    //   );
    // }
    const photoURL = await saveFile(
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

const saveFile = async (
  file: File,
  title: string,
  date: string,
  type: Type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);

  //!Formatting du nom du dossier
  const relativeUploadDir = `/${type}/${date}-${title
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[/.]/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}`;
  const uploadDir = join(env.DATA_FOLDER, "photos", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      //!Création du dossier
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
    //!Formatting du nom du fichier
    const filename = `${cover ? "cover-" : ""}${file.name
      .toLocaleLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/[/.]/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}.${mime.getExtension(file.type)}`;

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
