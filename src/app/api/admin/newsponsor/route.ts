import sizeOf from "image-size";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, stat, writeFile } from "fs/promises";
import { join } from "path";
import mime from "mime";
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

export async function POST(request: NextRequest) {
  try {
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
    console.log(sponsor);

    return NextResponse.json({ sponsor: sponsor }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}

const saveFile = async (file: File, name: string) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);
  const relativeUploadDir = `/SPONSORS/${name
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/é/g, "e")
    .replace(/è/g, "e")
    .replace(/ê/g, "e")
    .replace(/à/g, "a")
    .replace(/â/g, "a")}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(
        "Error while trying to create directory when uploading a file\n",
        e,
      );
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 },
      );
    }
  }
  try {
    const filename = `${file.name
      .toLocaleLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ê/g, "e")
      .replace(/à/g, "a")
      .replace(/â/g, "a")}.${mime.getExtension(file.type)}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    return `${relativeUploadDir}/${filename}`;
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
};
