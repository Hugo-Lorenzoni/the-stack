import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { Photo } from "@prisma/client";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path, { join } from "path";
import { env } from "process";

export const DELETE = withLogging(async (req, { wideEvent }) => {
  const body: Photo = await req.json();
  wideEvent.action = "delete_photo";
  wideEvent.photo_id = body.id;

  const filePath = join(env.DATA_FOLDER, "photos", body.url);

  if (!existsSync(filePath)) {
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

  if (!result) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
  const { name } = result;
  return new Response(JSON.stringify(name));
});
