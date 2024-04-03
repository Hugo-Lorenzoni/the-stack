import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

import * as z from "zod";
import { saveFileS3 } from "@/utils/saveFileS3";

type Values = {
  type: "BAPTISE" | "OUVERT" | "AUTRE";
  title: string;
  notes?: string | undefined;
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values") as string;
    if (!values) {
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }
    const { title, date, notes, pinned, type, password }: Values =
      JSON.parse(values);
    // console.log(date);

    const dateFormat = new Date(date);
    // console.log(dateFormat);

    const dateString = new Date(dateFormat.setDate(dateFormat.getDate() + 1))
      .toISOString()
      .substring(0, 10);
    // console.log(dateString);

    if (!password && type == "AUTRE") {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
    const coverFile = data.get("cover") as File;
    const coverArray = await coverFile.arrayBuffer();
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
    const coverUrl = await saveFileS3(coverFile, title, dateString, type, true);

    const parsedCover = photoSchema.parse({
      name: coverFile.name,
      url: coverUrl,
      width: coverDismensions.width,
      height: coverDismensions.height,
    });
    if (!parsedCover) {
      return NextResponse.json(
        { error: "Something went wrong." },
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
        coverName: parsedCover.name,
        coverUrl: parsedCover.url,
        coverWidth: parsedCover.width,
        coverHeight: parsedCover.height,
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
