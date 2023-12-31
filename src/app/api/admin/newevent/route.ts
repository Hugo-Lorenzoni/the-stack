import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, stat, writeFile } from "fs/promises";
import { Type } from "@prisma/client";
import { join } from "path";
import mime from "mime";
import * as z from "zod";

type Values = {
  type: "BAPTISE" | "OUVERT" | "AUTRE";
  title: string;
  notes?: string | undefined;
  date: string;
  pinned: boolean;
  password?: string | undefined;
};

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
const photosSchema = z.array(photoSchema).nonempty();

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values") as string;
    if (!values) {
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }
    const { title, date, notes, pinned, type, password }: Values =
      JSON.parse(values);
    // console.log(date);

    const dateFormat = new Date(date);
    // console.log(dateFormat);

    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);

    if (!password && type == "AUTRE") {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    const coverFile = data.get("cover") as File;
    const coverArray = await coverFile.arrayBuffer();
    const coverDismensions = sizeOf(Buffer.from(coverArray));
    if (
      coverDismensions.height &&
      coverDismensions.width &&
      coverDismensions.height >= coverDismensions.width
    ) {
      return NextResponse.json(
        { error: "Unsupported Media Type" },
        { status: 415 },
      );
    }
    const coverUrl = await saveFile(coverFile, title, dateString, type, true);

    const parsedCover = photoSchema.parse({
      name: coverFile.name,
      url: coverUrl,
      width: coverDismensions.width,
      height: coverDismensions.height,
    });
    if (!parsedCover) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const photosFiles = data.getAll("file") as Array<File>;
    const photos = await Promise.all(
      photosFiles.map(async (photo) => {
        const photoURL = await saveFile(photo, title, dateString, type, false);
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

    const event = await prisma.event.create({
      data: {
        title: title,
        date: dateFormat,
        notes: notes,
        pinned: pinned,
        type: type,
        password: password,
        coverName: parsedCover.name,
        coverUrl: parsedCover.url,
        coverWidth: parsedCover.width,
        coverHeight: parsedCover.height,
        photos: {
          createMany: {
            data: parsedPhotos,
          },
        },
      },
    });
    //   console.log(event);

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

  //!Formatting du nom du dossier
  const relativeUploadDir = `/${type}/${date}-${title
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[/.]/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

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
