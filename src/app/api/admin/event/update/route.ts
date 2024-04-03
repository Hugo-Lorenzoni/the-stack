import minioClient from "@/lib/minio";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
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
    const { id, title, date, pinned, type, password, notes } = result.data;
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
        coverUrl: true,
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

    const dateFormat = new Date(date);
    // console.log(dateFormat);
    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);

    if (
      title === oldEvent.title &&
      dateString === oldDateString &&
      type === oldEvent.type
    ) {
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

    const oldPath = `/${oldEvent.type}/${oldDateString}-${oldEvent.title
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/[/.]/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}`;
    // console.log(oldPath);

    const newPath = `/${type}/${dateString}-${title
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/[/.]/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}`;
    // console.log(newPath);

    const photos = await Promise.all(
      oldEvent.photos.map(async (photo) => {
        const oldUrl = photo.url;

        //! Not working
        // Replace the old path with the new path
        // const newUrl = oldUrl.replace(oldPath, newPath);
        // const newUrl = photo.url.replace(oldPath, newPath);
        const newUrl = photo.url
          .replace(oldEvent.title, title)
          .replace(oldDateString, dateString)
          .replace(oldEvent.type, type);
        console.log(newUrl);

        const oldObjectPath = `/cpv${oldUrl}`;
        const newObjectPath = newUrl.substring(1);

        try {
          await minioClient.copyObject("cpv", newObjectPath, oldObjectPath),
            function (e: Error, data: { etag: string; lastModified: Date }) {
              if (e) {
                console.log(e);
                throw e;
              }
            };
        } catch (error) {
          console.log(error);
        }
        return { ...photo, newUrl };
      }),
    );

    const newCoverUrl = oldEvent.coverUrl.replace(oldPath, newPath);
    const oldCoverObjectPath = `/cpv${oldEvent.coverUrl}`;
    const newCoverObjectPath = newCoverUrl.substring(1);

    try {
      await minioClient.copyObject(
        "cpv",
        newCoverObjectPath,
        oldCoverObjectPath,
      ),
        function (e: Error, data: { etag: string; lastModified: Date }) {
          if (e) {
            console.log(e);
            throw e;
          }
        };
    } catch (error) {
      console.log(error);

      return NextResponse.json(
        { error: "Failed to move the photo" },
        { status: 500 },
      );
    }

    try {
      const objectsList = oldEvent.photos.map((photo) => photo.url); // Extract the photo URLs from the event object
      objectsList.push(oldEvent.coverUrl); // Add the cover URL to the list of objects to delete

      minioClient.removeObjects("cpv", objectsList, function (e: Error | null) {
        if (e) {
          return console.log(e);
        }
      });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to move the photo" },
        { status: 500 },
      );
    }

    console.log(photos);

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
          coverUrl: newCoverUrl,
          password: type === "AUTRE" ? password : null,
          notes: notes,
        },
      }),
      ...photos.map((photo) =>
        prisma.photo.update({
          where: {
            id: photo.id,
          },
          data: {
            url: photo.newUrl,
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
