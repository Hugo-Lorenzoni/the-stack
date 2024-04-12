import minioClient from "@/lib/minio";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().uuid();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = idSchema.safeParse(body);

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const event = await prisma.event.delete({
      where: {
        id: result.data,
      },
      select: {
        title: true,
        date: true,
        type: true,
        coverUrl: true,
        photos: {
          select: { url: true },
        },
      },
    });
    console.log(event);
    if (!event) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const objectsList = event.photos.map((photo) => photo.url); // Extract the photo URLs from the event object
    objectsList.push(event.coverUrl); // Add the cover URL to the list of objects to delete
    console.log(objectsList);

    minioClient.removeObjects("cpv", objectsList, function (e: Error | null) {
      if (e) {
        return console.log(e);
      }
      console.log("Success");
    });
    console.log("Files deleted successfully");

    return new Response(JSON.stringify(event.title));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
