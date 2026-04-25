import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { Photo } from "@prisma/client";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path, { join } from "path";
import { env } from "process";

export async function DELETE(request: Request) {
  try {
    const body: Photo = await request.json();

    const filePath = join(env.DATA_FOLDER, "photos", body.url);
    // console.log(await stat(filePath));

    if (!existsSync(filePath)) {
      postHogServerClient.captureException(
        new Error(`File not found at path: ${filePath}`),
      );
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }
    await unlink(filePath);

    // Delete the other versions of the photo
    for (const quality of [
      "thumbnail",
      "preview",
      "full",
      "placeholder",
    ] as const) {
      const qualityPath = path
        .format({
          ...path.parse(filePath),
          base: undefined, // so it uses name + ext instead of base
          ext: "webp",
        })
        .replace(/\.(?=[^.]*$)/, `_${quality}.`);

      if (existsSync(qualityPath)) {
        await unlink(qualityPath);
      }
    }

    const result = await prisma.photo.delete({
      where: {
        id: body.id,
      },
    });
    // console.log(result);
    if (!result) {
      postHogServerClient.captureException(
        new Error(`Failed to delete photo with id: ${body.id}`),
      );
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const { name } = result;
    return new Response(JSON.stringify(name));
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
