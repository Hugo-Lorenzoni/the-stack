import minioClient from "@/lib/minio";
import mime from "mime";

import { Event_type } from "@prisma/client";

import { NextResponse } from "next/server";
import { encodeString } from "@/utils/encodeString";
import { encodePath } from "@/utils/encodePath";

export const saveFileS3 = async (
  file: File,
  title: string,
  date: string,
  type: Event_type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);

  //!Formatting du nom du dossier
  const s3UploadDir = encodePath(type, date, title);

  //!Formatting du nom du fichier
  const filename = `${cover ? "cover-" : ""}${encodeString(
    file.name,
  )}.${mime.getExtension(file.type)}`;

  const s3FileName = `${s3UploadDir}/${filename}`;
  console.log(s3FileName);

  try {
    const submitFileDataResult = await minioClient
      .putObject("cpv", s3FileName, buffer)
      .catch((e: any) => {
        console.log("Error while creating object from file data: ", e);
        throw e;
      });

    console.log("File data submitted successfully: ", submitFileDataResult);
    return s3FileName;
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
};
