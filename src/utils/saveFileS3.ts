import minioClient from "@/lib/minio";
import mime from "mime";
import sharp from "sharp";
import * as z from "zod";
import path from "node:path";

import { Event_type } from "@prisma/client";

import { encodeString } from "@/utils/encodeString";
import { encodePath } from "@/utils/encodePath";

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  urlLow: z.string(),
  width: z.number(),
  height: z.number(),
});

export const saveFileS3 = async (
  file: File,
  title: string,
  date: string,
  type: Event_type,
  cover: boolean,
) => {
  const fileArray = await file.arrayBuffer();
  const buffer = Buffer.from(fileArray);
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) return null;

  const fileExtension = `.${mime.getExtension(file.type)}`;

  //!Formatting du nom du dossier
  const s3UploadDir = encodePath(type, date, title);

  //!Formatting du nom du fichier
  const filename = `${encodeString(
    path.parse(file.name).name,
  )}${fileExtension}`;

  const s3FileName = `${s3UploadDir}/${filename}`;
  console.log(s3FileName);

  try {
    if (!cover) {
      const submitFileDataResult = await minioClient
        .putObject("cpv", s3FileName, buffer)
        .catch((e: any) => {
          console.log("Error while creating object from file data: ", e);
          throw e;
        });
      console.log("File data submitted successfully: ", submitFileDataResult);
    }

    const sharpBuffer = await sharp(buffer)
      .resize(Math.round(metadata.width / 2))
      .webp({
        quality: 10,
      })
      .toBuffer();

    const s3SharpFileName = cover
      ? `${s3UploadDir}/cover_${filename.split(".")[0]}.webp`
      : `${s3UploadDir}/${filename.replace(".", "-")}_low.webp`;

    await minioClient
      .putObject("cpv", s3SharpFileName, sharpBuffer)
      .catch((e: any) => {
        console.log("Error while creating object from file data: ", e);
        throw e;
      });

    const photo = {
      name: file.name,
      url: s3FileName,
      urlLow: s3SharpFileName,
      width: metadata.width,
      height: metadata.height,
    };

    const result = photoSchema.safeParse(photo);

    return result.success ? result.data : null;
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return null;
  }
};
