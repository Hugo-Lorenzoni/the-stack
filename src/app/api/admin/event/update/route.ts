import { getDirectoryPath } from "@/lib/path";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { move } from "fs-extra";
import { rename } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { basename, join } from "path";
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
      console.log(result.error);
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
    if (
      type !== oldEvent.type ||
      title !== oldEvent.title ||
      date !== oldEvent.date.toISOString()
    ) {
      if (type !== oldEvent.type) {
        console.log(`Type changed from ${oldEvent.type} to ${type}`);
        move(src, dest, (err) => {
          if (err) {
            return (
              console.error(err),
              NextResponse.json(
                { error: "Failed to move the files" },
                { status: 500 },
              )
            );
          }
          console.log(`${id} - ${title} - Move successful !`);
        });
      } else if (
        title !== oldEvent.title ||
        date !== oldEvent.date.toISOString()
      ) {
        try {
          await rename(src, dest);
          console.log(`${id} - ${title} - Rename successful !`);
        } catch (error) {
          console.error(error);
          return NextResponse.json(
            { error: "Failed to rename the directory" },
            { status: 500 },
          );
        }
      } else {
        // Logging everything for debugging purposes
        console.log(
          `No files were moved or renamed for ${title}, ${type}, ${date}`,
        );
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
      // console.log(event);
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
    // console.log(data);
    return NextResponse.json({ event: data[0] }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
