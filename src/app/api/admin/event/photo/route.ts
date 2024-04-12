import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import prisma from "@/lib/prisma";

import { saveFileS3 } from "@/utils/saveFileS3";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const valuesSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string(),
  type: z.enum(TypeList),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values");
    const file = data.get("file");

    if (
      !values ||
      typeof values !== "string" ||
      !file ||
      !(file instanceof File)
    ) {
      return NextResponse.json(
        { message: "Invalid request: Missing values or file." },
        { status: 500 },
      );
    }

    const result = valuesSchema.safeParse(JSON.parse(values));

    if (!result.success) {
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const event = result.data;

    const dateString = new Date(event.date).toISOString().substring(0, 10);

    const photo = await saveFileS3(
      file,
      event.title,
      dateString,
      event.type,
      false,
    );

    if (!photo) {
      console.log("Error while saving file to S3");
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const res = await prisma.event.update({
      where: { id: event.id },
      data: {
        photos: {
          create: {
            ...photo,
          },
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
      },
    });
    if (!res) {
      console.log(`Error while adding ${photo.name} to event (${event.id})`);
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    return NextResponse.json({ event: res, photo: photo }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
