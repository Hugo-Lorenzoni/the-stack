import { getDirectoryPath } from "@/lib/path";
import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { move } from "fs-extra";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { env } from "process";
import * as z from "zod";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const valuesSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    date: z.string(),
    pinned: z.boolean(),
    type: z.enum(TypeList),
    password: z.string().optional(),
    notes: z.string().max(750).optional(),
  })
  .refine((data) => data.type !== "AUTRE" || data.password, {
    message: "Un mot de passe est requis pour les événement de type AUTRE",
    path: ["password"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // console.log(body);

    const result = valuesSchema.safeParse(body);

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    // console.log(result.data);
    const { id, title, date, pinned, type, password, notes } = result.data;

    const oldEvent = await prisma.event.findUnique({
      where: { id: id },
      select: {
        title: true,
        date: true,
        pinned: true,
        type: true,
        password: true,
        photos: true,
        coverUrl: true,
      },
    });
    // console.log(oldEvent);

    if (!oldEvent) {
      postHogServerClient.captureException(
        new Error(`Event with id ${id} not found`),
      );
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const oldPath = getDirectoryPath(
      oldEvent.type,
      oldEvent.date,
      oldEvent.title,
    );
    // console.log(oldPath);

    const src = join(env.DATA_FOLDER, "photos", oldPath);

    console.log("Updated date", date);

    const nearestDate = getNearestMidnight(date);
    console.log(nearestDate);

    const newPath = getDirectoryPath(type, nearestDate, title);
    // console.log(newPath);

    const dest = join(env.DATA_FOLDER, "photos", newPath);
    // console.log(src, dest);
    const shouldRelocateFiles = oldPath !== newPath;

    if (shouldRelocateFiles) {
      try {
        await move(src, dest);
        console.log(`${id} - ${title} - Move successful !`);
      } catch (error) {
        postHogServerClient.captureException(
          new Error(`Failed to move files for event ${id}`),
        );
        return NextResponse.json(
          { error: "Failed to move the files" },
          { status: 500 },
        );
      }
    }

    const photos = shouldRelocateFiles
      ? oldEvent.photos.map((photo) => {
          const url = photo.url.replace(oldPath, newPath);
          const { createdAt, updatedAt, ...data } = photo;
          return { ...data, url };
        })
      : oldEvent.photos;

    const coverUrl = shouldRelocateFiles
      ? oldEvent.coverUrl.replace(oldPath, newPath)
      : oldEvent.coverUrl;

    const data = await prisma.$transaction([
      prisma.event.update({
        where: {
          id: id,
        },
        data: {
          title: title,
          date: nearestDate,
          pinned: pinned,
          type: type,
          password: type === "AUTRE" ? password : null,
          notes: notes,
          coverUrl: coverUrl,
        },
      }),
      ...(shouldRelocateFiles
        ? photos.map((photo) =>
            prisma.photo.update({
              where: {
                id: photo.id,
              },
              data: {
                url: photo.url,
              },
            }),
          )
        : []),
    ]);
    // console.log(data);
    return NextResponse.json({ event: data[0] }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
