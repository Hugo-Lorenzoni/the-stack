import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, stat, writeFile } from "fs/promises";
import { Type } from "@prisma/client";
import { join } from "path";
import mime from "mime";
import * as z from "zod";

export const config = {
  api: {
    bodyParser: false,
  },
};

type Values = {
  type: "BAPTISE" | "OUVERT" | "AUTRE";
  title: string;
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
    const { title, date, pinned, type, password }: Values = JSON.parse(values);

    const coverFile = data.get("cover") as File;
    const coverUrl = await saveFile(coverFile, title, date, type);
    const coverDismensions = sizeOf(Buffer.from(await coverFile.arrayBuffer()));
    const parsedCover = photoSchema.parse({
      name: coverFile.name,
      url: coverUrl,
      width: coverDismensions.width,
      height: coverDismensions.height,
    });
    if (!parsedCover) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }

    const photosFiles = data.getAll("file") as Array<File>;
    const photos = await Promise.all(
      photosFiles.map(async (photo) => {
        const photoURL = await saveFile(photo, title, date, type);
        const photoDismensions = sizeOf(Buffer.from(await photo.arrayBuffer()));
        return {
          name: photo.name,
          url: photoURL,
          width: photoDismensions.width,
          height: photoDismensions.height,
        };
      })
    );
    const parsedPhotos = photosSchema.parse(photos);
    if (!parsedPhotos) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: title,
        date: date,
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
      { status: 500 }
    );
  }
}

const saveFile = async (
  file: File,
  title: string,
  date: string,
  type: Type
) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativeUploadDir = `/${type}/${date.substring(0, 10)}-${title.replace(
    /\.[^/.]+$/,
    ""
  )}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(
        "Error while trying to create directory when uploading a file\n",
        e
      );
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }
  }
  try {
    const filename = `${file.name.replace(/\.[^/.]+$/, "")}.${mime.getExtension(
      file.type
    )}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    return `${relativeUploadDir}/${filename}`;
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
};
