import { saveFile } from "@/lib/files";
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
      return NextResponse.json({ message: "No values" }, { status: 500 });
    }

    const parsedValues = JSON.parse(values);
    const result = z.object({ id: z.string().min(1) }).safeParse(parsedValues);
    if (!result.success) {
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong!" },
        { status: 500 },
      );
    }

    console.log("Event ID:", result.data.id);

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

    console.log("Cover dimensions:", coverDismensions);

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

    console.log("Current event:", currentEvent);

    const coverUrl = await saveFile(
      coverFile,
      currentEvent.title,
      currentEvent.date,
      currentEvent.type,
      true,
    );

    console.log("Cover URL:", coverUrl);

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

    console.log("Parsed cover:", parsedCover);

    const updatedEvent = await prisma.event.update({
      where: { id: currentEvent.id },
      data: {
        coverUrl: parsedCover.url,
        coverName: parsedCover.name,
        coverWidth: parsedCover.width,
        coverHeight: parsedCover.height,
      },
    });

    console.log("Updated event:", updatedEvent);

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

    if (!existsSync(oldCoverPath)) {
      console.log("Old cover deleted");
    }

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
