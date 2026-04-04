import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from "zod";
import { getNearestMidnight } from "@/lib/time";
import { saveFile } from "@/lib/files";
import { withLogging } from "@/lib/withLogging";

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

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "create_event";
  wideEvent.resource = "event";

  const data = await req.formData();

  const values = data.get("values") as string;
  if (!values) {
    return NextResponse.json({ message: "No values" }, { status: 500 });
  }
  const { title, date, notes, pinned, type, password }: Values =
    JSON.parse(values);

  const nearestDate = getNearestMidnight(date);

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
  const coverUrl = await saveFile(coverFile, title, nearestDate, type, true);

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
      date: nearestDate,
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

  wideEvent.event_type = type;
  wideEvent.event_id = event.id;

  return NextResponse.json({ event: event }, { status: 200 });
});
