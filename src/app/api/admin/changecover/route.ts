import { saveFile } from "@/lib/files";
import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import sizeOf from "image-size";
import { NextRequest, NextResponse } from "next/server";
import { format, join, parse } from "path";
import { env } from "process";
import { z } from "zod";

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
      postHogServerClient.captureException(
        new Error("No values provided in the request"),
      );
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }

    const parsedValues = JSON.parse(values);
    const result = z.object({ id: z.string().min(1) }).safeParse(parsedValues);
    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Something went wrong!" },
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
      postHogServerClient.captureException(
        new Error("Invalid cover dimensions: height must be less than width"),
      );
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
      postHogServerClient.captureException(new Error("Event not found"));
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
      width: coverDismensions.width,
      height: coverDismensions.height,
    });
    if (!parsedCover) {
      postHogServerClient.captureException(
        new Error("Parsed cover validation failed"),
      );
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
      postHogServerClient.captureException(
        new Error("Old cover file not found"),
      );
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
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
