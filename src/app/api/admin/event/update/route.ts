import prisma from "@/lib/prisma";
import { move } from "fs-extra";
import { rename } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
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
  })
  .refine((data) => data.type != "AUTRE" || data.password, {
    message: "Un mot de passe est requis pour les événement de type AUTRE",
    path: ["password"], // path of error
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // console.log(body);

    const result = valuesSchema.safeParse(body);

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    // console.log(result.data);
    const { id, title, date, pinned, type, password } = result.data;
    // console.log({ id, title, date, type, password });
    if (!password && type == "AUTRE") {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const oldEvent = await prisma.event.findUnique({
      where: { id: id },
      select: {
        title: true,
        date: true,
        pinned: true,
        type: true,
        password: true,
        photos: true,
      },
    });
    // console.log(oldEvent);

    if (!oldEvent || !oldEvent.photos) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const oldDateString = new Date(oldEvent.date.toISOString().substring(0, 10))
      .toISOString()
      .substring(0, 10);
    const oldPath = `/${oldEvent.type}/${oldDateString}-${oldEvent.title
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ê/g, "e")
      .replace(/à/g, "a")
      .replace(/â/g, "a")}`;
    // console.log(oldPath);

    const src = join(process.cwd(), "public", oldPath);

    const dateFormat = new Date(date);
    // console.log(dateFormat);
    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);
    const newPath = `/${type}/${dateString}-${title
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ê/g, "e")
      .replace(/à/g, "a")
      .replace(/â/g, "a")}`;
    // console.log(newPath);

    const dest = join(process.cwd(), "public", newPath);
    // console.log(src, dest);
    if (type !== oldEvent.type) {
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
    } else if (title !== oldEvent.title || dateString !== oldDateString) {
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
      const event = await prisma.event.update({
        where: {
          id: id,
        },
        data: {
          title: title,
          date: dateFormat,
          pinned: pinned,
          type: type,
          password: type === "AUTRE" ? password : null,
        },
      });
      // console.log(event);
      return NextResponse.json({ event: event }, { status: 200 });
    }

    // console.log(oldEvent.photos);

    const photos = oldEvent.photos.map((photo) => {
      const url = photo.url.replace(oldPath, newPath);
      const { createdAt, updatedAt, ...data } = photo;
      return { ...data, url };
    });
    // console.log(photos);

    const data = await prisma.$transaction([
      prisma.event.update({
        where: {
          id: id,
        },
        data: {
          title: title,
          date: dateFormat,
          pinned: pinned,
          type: type,
          password: type === "AUTRE" ? password : null,
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
