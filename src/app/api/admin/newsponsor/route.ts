import sizeOf from "image-size";

import { getFileName, getFormattedString } from "@/lib/path";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { mkdir, stat, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { env } from "process";
import * as z from "zod";

type Values = {
  name: string;
  url: string;
};

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export const POST = withLogging(async (request: NextRequest, { wideEvent }) => {
  wideEvent.action = "new_sponsor";

  const data = await request.formData();

  const values = data.get("values") as string;
  if (!values) {
    return NextResponse.json({ message: "No values" }, { status: 500 });
  }
  const { name, url }: Values = JSON.parse(values);

  const logoFile = data.get("logo") as File;
  const logoUrl = await saveFile(logoFile, name);
  const logoArray = await logoFile.arrayBuffer();
  const logoDismensions = sizeOf(Buffer.from(logoArray));
  const parsedlogo = photoSchema.parse({
    name: logoFile.name,
    url: logoUrl,
    width: logoDismensions.width,
    height: logoDismensions.height,
  });
  if (!parsedlogo) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }

  const sponsor = await prisma.sponsor.create({
    data: {
      name: name,
      url: url,
      logoName: parsedlogo.name,
      logoUrl: parsedlogo.url,
      logoWidth: parsedlogo.width,
      logoHeight: parsedlogo.height,
    },
  });

  wideEvent.sponsor_id = sponsor.id;

  return NextResponse.json({ sponsor: sponsor }, { status: 200 });
});

// Specific version of saveFile for sponsors
const saveFile = async (file: File, name: string) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);
  const relativeUploadDir = `/SPONSORS/${getFormattedString(name)}`;
  const uploadDir = join(env.DATA_FOLDER, "photos", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      throw e;
    }
  }

  const filename = getFileName(file, false);
  await writeFile(`${uploadDir}/${filename}`, buffer);
  return `${relativeUploadDir}/${filename}`;
};
