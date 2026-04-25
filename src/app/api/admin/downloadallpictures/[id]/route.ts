"use server";

import prisma from "@/lib/prisma";
import { getNextAuthSession } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { join } from "node:path";
import { env } from "node:process";
import { access, readFile } from "node:fs/promises";
import z from "zod";
import { existsSync } from "node:fs";
import { getFormattedString } from "@/lib/path";
import { postHogServerClient } from "@/lib/posthog";

const idSchema = z.string().uuid().min(1);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = idSchema.safeParse(id);

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const eventId = result.data;

    // Check permissions or authentication of the user
    const session = await getNextAuthSession();
    if (session?.user?.role !== "ADMIN") {
      postHogServerClient.captureException(new Error("Unauthorized access"));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
      postHogServerClient.captureException(
        new Error("No photos found for this event"),
      );
      return NextResponse.json(
        { error: "No photos found for this event" },
        { status: 404 },
      );
    }

    const eventTitle = getFormattedString(event.title);

    const zip = new JSZip();
    const photoFolder = zip.folder(`${eventTitle}_photos`);

    for (const photo of event.photos) {
      try {
        const photoPath = join(env.DATA_FOLDER, "photos", photo.url);

        // Check if file exists

        // Read the file
        if (existsSync(photoPath)) {
          const photoBuffer = await readFile(photoPath);

          // Add to zip with original filename or custom name
          const fileName = photo.name;
          photoFolder?.file(fileName, photoBuffer);
        } else {
          postHogServerClient.captureException(
            new Error(`Photo file not found at path: ${photoPath}`),
          );
          console.warn(`Photo file not found: ${photoPath}`);
          // Continue with other photos even if one fails
        }
      } catch (fileError) {
        postHogServerClient.captureException(
          fileError,
          "Failed to add photo to zip",
        );
        console.error(`Failed to add photo ${photo.name} to zip:`, fileError);
        // Continue with other photos even if one fails
      }
    }

    // Generate zip buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      // compression: "DEFLATE",
      // compressionOptions: {
      //   level: 6,
      // },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${eventTitle}_photos.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Failed to download pictures" },
      { status: 500 },
    );
  }
}
