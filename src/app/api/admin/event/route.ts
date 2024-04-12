import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import * as z from "zod";
import { saveFileS3 } from "@/utils/saveFileS3";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const valuesSchema = z.object({
  title: z.string(),
  date: z.string(),
  type: z.enum(TypeList),
  notes: z.string().optional(),
  pinned: z.boolean(),
  password: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values");
    const file = data.get("cover");

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

    const { title, date, notes, pinned, type, password } = result.data;

    const dateFormat = new Date(date);

    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);

    if (!password && type == "AUTRE") {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }

    const coverArray = await file.arrayBuffer();
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

    const cover = await saveFileS3(file, title, dateString, type, true);

    if (!cover) {
      console.log("Error while saving file to S3");
      return NextResponse.json(
        { message: "Error while uploading" },
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
        coverName: cover.name,
        coverUrl: cover.urlLow, //! urlLow
        coverWidth: cover.width,
        coverHeight: cover.height,
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
