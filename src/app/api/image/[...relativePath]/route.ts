import { NextRequest, NextResponse } from "next/server";
import { streamToBuffer } from "@/lib/stream";
import sharp from "sharp";
import { env } from "process";
import path from "path";
import fs, { existsSync } from "fs";
import { writeFile } from "fs/promises";

// Define the allowed quality option keys
type QualityKey = keyof typeof qualityOptions;

// Array of quality options with their corresponding values
const qualityOptions = {
  thumbnail: { width: 600, qualityValue: 60 },
  preview: { width: 1600, qualityValue: 70 },
  full: { width: 1920, qualityValue: 80 },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ relativePath: string[] }> },
) {
  const { relativePath } = await params;

  if (!relativePath) {
    return NextResponse.json(
      { error: "File name is required" },
      { status: 400 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const isPlaceholder = searchParams.get("placeholder") === "true";
  const quality = searchParams.get("quality");

  let data: fs.ReadStream | null = null;

  if (isPlaceholder) {
    const placeholderFilename = path
      .format({
        ...path.parse(path.join(...relativePath)),
        base: undefined, // so it uses name + ext instead of base
        ext: "webp",
      })
      .replace(/\.(?=[^.]*$)/, "_placeholder.");

    const placeholderFilePath = path.join(
      env.DATA_FOLDER,
      "photos",
      placeholderFilename,
    );

    if (!existsSync(placeholderFilePath)) {
      const originalPath = path.join(
        env.DATA_FOLDER,
        "photos",
        ...relativePath,
      );
      const originalStream = fs.createReadStream(originalPath);
      const originalBuffer = await streamToBuffer(originalStream);
      const placeholderBuffer = await sharp(originalBuffer)
        .blur(1)
        .resize(50)
        .toFormat("webp")
        .toBuffer();

      // log the size in bytes of the blurBuffer and the % difference
      // console.log(
      //   `Blurred image size: ${placeholderBuffer.length} bytes (original: ${
      //     imageBuffer.length
      //   } bytes) > ${(
      //     (placeholderBuffer.length / imageBuffer.length) *
      //     100
      //   ).toFixed(2)}% of original size`,
      // );

      await writeFile(placeholderFilePath, placeholderBuffer);

      const placeholderStream = new ReadableStream({
        async pull(controller) {
          controller.enqueue(placeholderBuffer);
          controller.close();
        },
      });

      return new NextResponse(placeholderStream);
    } else {
      data = fs.createReadStream(placeholderFilePath);
    }
  } else {
    const originalPath = path.join(env.DATA_FOLDER, "photos", ...relativePath);
    let filePath = originalPath;

    if (quality && quality in qualityOptions) {
      filePath = path.format({
        ...path.parse(filePath),
        base: undefined, // so it uses name + ext instead of base
        ext: "webp",
      });
      if (!existsSync(filePath)) {
        const { qualityValue, width } = qualityOptions[quality as QualityKey];

        const originalStream = fs.createReadStream(originalPath);
        const originalBuffer = await streamToBuffer(originalStream);
        const compressedBuffer = await sharp(originalBuffer)
          .resize(width)
          .webp({ quality: qualityValue })
          .toBuffer();

        // console.log(
        //   `Compressed image size: ${compressedBuffer.length} bytes (original: ${
        //     originalBuffer.length
        //   } bytes) > ${(
        //     (compressedBuffer.length / originalBuffer.length) *
        //     100
        //   ).toFixed(2)}% of original size`,
        // );

        await writeFile(filePath, compressedBuffer);
        const compressedStream = new ReadableStream({
          async pull(controller) {
            controller.enqueue(compressedBuffer);
            controller.close();
          },
        });
        return new NextResponse(compressedStream);
      }
    }

    data = fs.createReadStream(filePath);
  }

  if (!data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      if (data) {
        data.on("data", (chunk) => controller.enqueue(chunk));
        data.on("end", () => controller.close());
        data.on("error", (err) => controller.error(err));
      }
    },
  });

  return new NextResponse(stream);
}
