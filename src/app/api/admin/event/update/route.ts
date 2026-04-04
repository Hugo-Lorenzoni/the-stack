import { getDirectoryPath } from "@/lib/path";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { withLogging } from "@/lib/withLogging";
import { move } from "fs-extra";
import { rename } from "fs/promises";
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

export const POST = withLogging(async (req: NextRequest, { wideEvent }) => {
  const body = await req.json();

  const result = valuesSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const { id, title, date, pinned, type, password, notes } = result.data;

  wideEvent.action = "update_event";
  wideEvent.event_id = id;

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

  if (!oldEvent) {
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

  const src = join(env.DATA_FOLDER, "photos", oldPath);

  const nearestDate = getNearestMidnight(date);

  const newPath = getDirectoryPath(type, nearestDate, title);

  const dest = join(env.DATA_FOLDER, "photos", newPath);

  if (
    type !== oldEvent.type ||
    title !== oldEvent.title ||
    date !== oldEvent.date.toISOString()
  ) {
    if (type !== oldEvent.type) {
      move(src, dest, (err) => {
        if (err) {
          return NextResponse.json(
            { error: "Failed to move the files" },
            { status: 500 },
          );
        }
      });
    } else if (
      title !== oldEvent.title ||
      date !== oldEvent.date.toISOString()
    ) {
      try {
        await rename(src, dest);
      } catch {
        return NextResponse.json(
          { error: "Failed to rename the directory" },
          { status: 500 },
        );
      }
    }
  } else {
    const event = await prisma.event.update({
      where: {
        id: id,
      },
      data: {
        pinned: pinned,
        password: type === "AUTRE" ? password : null,
        notes: notes,
      },
    });
    return NextResponse.json({ event: event }, { status: 200 });
  }

  const photos = oldEvent.photos.map((photo) => {
    const url = photo.url.replace(oldPath, newPath);
    const { createdAt, updatedAt, ...data } = photo;
    return { ...data, url };
  });

  const coverUrl = oldEvent.coverUrl.replace(oldPath, newPath);

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
    ...photos.map((photo) =>
      prisma.photo.update({
        where: {
          id: photo.id,
        },
        data: {
          url: photo.url,
        },
      }),
    ),
  ]);

  return NextResponse.json({ event: data[0] }, { status: 200 });
});
