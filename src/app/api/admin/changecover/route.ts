import { saveFile } from "@/lib/files";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import sizeOf from "image-size";
import { NextResponse } from "next/server";
import { format, join, parse } from "path";
import { env } from "process";
import { z } from "zod";

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "change_cover";

  const data = await req.formData();

  const values = data.get("values") as string;
  if (!values) {
    return NextResponse.json({ message: "No values" }, { status: 500 });
  }

  const parsedValues = JSON.parse(values);
  const result = z.object({ id: z.string().min(1) }).safeParse(parsedValues);
  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }

  wideEvent.event_id = result.data.id;

  const coverFile = data.get("cover") as File;
  const coverArray = await coverFile.arrayBuffer();
  const coverDimensions = sizeOf(Buffer.from(coverArray));
  if (
    coverDimensions.height &&
    coverDimensions.width &&
    coverDimensions.height >= coverDimensions.width
  ) {
    return NextResponse.json(
      { error: "Unsupported Media Type" },
      { status: 415 },
    );
  }

  const currentEvent = await prisma.event.findUnique({
    where: { id: result.data.id },
    select: {
      id: true,
      title: true,
      date: true,
      type: true,
      coverUrl: true,
    },
  });
  if (!currentEvent) {
    return NextResponse.json(
      { error: "Could not find the event" },
      { status: 500 },
    );
  }

  const coverUrl = await saveFile(
    coverFile,
    currentEvent.title,
    currentEvent.date,
    currentEvent.type,
    true,
  );

  const parsedCover = photoSchema.parse({
    name: coverFile.name,
    url: coverUrl,
    width: coverDimensions.width,
    height: coverDimensions.height,
  });
  if (!parsedCover) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  const updatedEvent = await prisma.event.update({
    where: { id: currentEvent.id },
    data: {
      coverUrl: parsedCover.url,
      coverName: parsedCover.name,
      coverWidth: parsedCover.width,
      coverHeight: parsedCover.height,
    },
  });

  const oldCoverPath = join(env.DATA_FOLDER, "photos", currentEvent.coverUrl);

  if (!existsSync(oldCoverPath)) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
  await unlink(oldCoverPath);

  // Delete the other versions of the photo
  for (const quality of [
    "thumbnail",
    "preview",
    "full",
    "placeholder",
  ] as const) {
    const qualityPath = format({
      ...parse(oldCoverPath),
      base: undefined, // so it uses name + ext instead of base
      ext: "webp",
    }).replace(/\.(?=[^.]*$)/, `_${quality}.`);

    if (existsSync(qualityPath)) {
      await unlink(qualityPath);
    }
  }

  return NextResponse.json({ event: updatedEvent }, { status: 200 });
});
