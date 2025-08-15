import { Type } from "@prisma/client";
import { getDirectoryPath, getFileName } from "./path";
import { join } from "path";
import { env } from "process";
import { mkdir, stat, writeFile } from "fs/promises";
import { NextResponse } from "next/server";

export const saveFile = async (
  file: File,
  title: string,
  date: Date,
  type: Type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);

  //!Formatting du nom du dossier
  const relativeUploadDir = getDirectoryPath(type, date, title);
  const uploadDir = join(env.DATA_FOLDER, "photos", relativeUploadDir);

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
    const filename = getFileName(file, cover);

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
