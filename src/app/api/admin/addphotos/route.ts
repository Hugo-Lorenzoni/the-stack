import sizeOf from "image-size";

import { saveFile } from "@/lib/files";
import { getDirectoryPath, getFileName } from "@/lib/path";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
      postHogServerClient.captureException(result.error);
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
    const relativeUploadDir = getDirectoryPath(
      currentEvent.type,
      currentEvent.date,
      currentEvent.title,
    );
    const fileInfos = photosFiles.map((photo) => {
      const filename = getFileName(photo, false);
      const relativeUrl = `${relativeUploadDir}/${filename}`;
      return {
        photo,
        relativeUrl,
        absolutePath: join(env.DATA_FOLDER, "photos", relativeUrl),
      };
    });

    const existingDbPhotos = await prisma.photo.findMany({
      where: { url: { in: fileInfos.map((info) => info.relativeUrl) } },
      select: { url: true },
    });
    if (existingDbPhotos.length > 0) {
      postHogServerClient.captureException(
        new Error(
          `Photo already exists in db: ${existingDbPhotos
            .map((photo) => photo.url)
            .join(", ")}`,
        ),
      );
      return NextResponse.json(
        { error: "Photo already exists" },
        { status: 409 },
      );
    }

    try {
      const existingDiskPhotos = await Promise.all(
        fileInfos.map(async (info) => {
          try {
            await stat(info.absolutePath);
            return info.relativeUrl;
          } catch (error: any) {
            if (error?.code === "ENOENT") {
              return null;
            }
            throw error;
          }
        }),
      );
      const existingDiskUrls = existingDiskPhotos.filter((url): url is string =>
        Boolean(url),
      );
      if (existingDiskUrls.length > 0) {
        postHogServerClient.captureException(
          new Error(
            `Photo already exists on disk: ${existingDiskUrls.join(", ")}`,
          ),
        );
        return NextResponse.json(
          { error: "Photo already exists" },
          { status: 409 },
        );
      }
    } catch (error) {
      postHogServerClient.captureException(error);
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    const photos = await Promise.all(
      fileInfos.map(async ({ photo }) => {
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
    let event;
    try {
      event = await prisma.event.update({
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Photo already exists" },
          { status: 409 },
        );
      }
      throw error;
    }
    if (!event) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    return NextResponse.json({ event: event }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
