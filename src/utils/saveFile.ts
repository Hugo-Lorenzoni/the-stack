import { mkdir, stat, writeFile } from "fs/promises";
import { join } from "path";
import mime from "mime";

import { Event_type } from "@prisma/client";

import { NextResponse } from "next/server";

//! OLD FUNCTION TO SAVE FILE ON SERVER (NOT USED ANYMORE) - KEEPING IT FOR REFERENCE
export const saveFile = async (
  file: File,
  title: string,
  date: string,
  type: Event_type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);

  //!Formatting du nom du dossier
  const relativeUploadDir = `/${type}/${date}-${title
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .replace(/[/.]/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}`;
  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      //!Création du dossier
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
    //!Formatting du nom du fichier
    const filename = `${cover ? "cover-" : ""}${file.name
      .toLocaleLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/[/.]/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")}.${mime.getExtension(file.type)}`;

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
