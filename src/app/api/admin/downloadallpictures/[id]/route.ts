import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { join } from "node:path";
import { env } from "node:process";
import { readFile } from "node:fs/promises";
import z from "zod";
import { existsSync } from "node:fs";
import { getFormattedString } from "@/lib/path";

const idSchema = z.string().uuid().min(1);

export const GET = withLogging(async (req, { params, wideEvent }) => {
  wideEvent.action = "download_all_pictures";

  const { id } = await params;

  const result = idSchema.safeParse(id);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const eventId = result.data;
  wideEvent.event_id = eventId;

  // Fetch the event data from the database
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      title: true,
      photos: true,
    },
  });

  // Get the photos and create a zip file
  if (!event || !event.photos || event.photos.length === 0) {
    return NextResponse.json(
      { error: "No photos found for this event" },
      { status: 404 },
    );
  }

  const eventTitle = getFormattedString(event.title);

  const zip = new JSZip();
  const photoFolder = zip.folder(`${eventTitle}_photos`);

  for (const photo of event.photos) {
    const photoPath = join(env.DATA_FOLDER, "photos", photo.url);

    if (existsSync(photoPath)) {
      const photoBuffer = await readFile(photoPath);
      photoFolder?.file(photo.name, photoBuffer);
    }
  }

  // Generate zip buffer
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${eventTitle}_photos.zip"`,
      "Content-Length": zipBuffer.length.toString(),
    },
  });
});
