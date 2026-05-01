import sizeOf from "image-size";
import { stat } from "fs/promises";
import { join } from "path";
import { env } from "process";

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { Prisma } from "@prisma/client";
import { getNearestMidnight } from "@/lib/time";
import { saveFile } from "@/lib/files";
import { getDirectoryPath } from "@/lib/path";
import { postHogServerClient } from "@/lib/posthog";

const valuesSchema = z.object({
  type: z.enum(["BAPTISE", "OUVERT", "AUTRE"]),
  title: z.string(),
  notes: z.string().max(750).optional(),
  date: z.string(),
  pinned: z.boolean(),
  password: z.string().optional(),
});

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const values = data.get("values") as string | null;
    if (!values) {
      postHogServerClient.captureException(
        new Error("Aucune valeur fournie dans la requête"),
      );
      return NextResponse.json(
        { message: "Aucune valeur fournie" },
        { status: 400 },
      );
    }
    let parsedValues: z.infer<typeof valuesSchema> | null = null;
    try {
      const json = JSON.parse(values);
      const result = valuesSchema.safeParse(json);
      if (!result.success) {
        postHogServerClient.captureException(
          new Error("Valeurs invalides fournies dans la requête"),
        );
        return NextResponse.json(
          { error: "Valeurs invalides", details: result.error.format() },
          { status: 400 },
        );
      }
      parsedValues = result.data;
    } catch (err) {
      postHogServerClient.captureException(err);
      return NextResponse.json(
        { error: "JSON invalide dans les valeurs" },
        { status: 400 },
      );
    }
    const { title, date, notes, pinned, type, password } = parsedValues;
    // console.log(date);

    const nearestDate = getNearestMidnight(date);
    // console.log(nearestDate);

    const existingEvent = await prisma.event.findFirst({
      where: {
        title,
        date: nearestDate,
        type,
      },
    });

    if (existingEvent) {
      postHogServerClient.captureException(
        new Error("Un événement avec le même nom et la même date existe déjà"),
      );
      return NextResponse.json(
        {
          error: "Un événement avec le même nom et la même date existe déjà",
        },
        { status: 409 },
      );
    }

    const relativeUploadDir = getDirectoryPath(type, nearestDate, title);
    const uploadDir = join(env.DATA_FOLDER, "photos", relativeUploadDir);

    try {
      await stat(uploadDir);
      postHogServerClient.captureException(
        new Error("Le dossier cible de l'événement existe déjà"),
      );
      return NextResponse.json(
        { error: "Le dossier cible de l'événement existe déjà" },
        { status: 409 },
      );
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        postHogServerClient.captureException(error);
        return NextResponse.json(
          { error: "Une erreur est survenue." },
          { status: 500 },
        );
      }
    }

    if (!password && type == "AUTRE") {
      postHogServerClient.captureException(
        new Error("Aucun mot de passe fourni pour un événement AUTRE"),
      );
      return NextResponse.json(
        {
          error: "Un mot de passe est requis pour les événements de type AUTRE",
        },
        { status: 500 },
      );
    }
    const coverFile = data.get("cover") as File;
    const coverArray = await coverFile.arrayBuffer();
    const coverDismensions = sizeOf(Buffer.from(coverArray));
    if (
      coverDismensions.height &&
      coverDismensions.width &&
      coverDismensions.height >= coverDismensions.width
    ) {
      return NextResponse.json(
        { error: "Format de média non pris en charge" },
        { status: 415 },
      );
    }
    const coverUrl = await saveFile(coverFile, title, nearestDate, type, true);

    const parsedCover = photoSchema.parse({
      name: coverFile.name,
      url: coverUrl,
      width: coverDismensions.width,
      height: coverDismensions.height,
    });
    if (!parsedCover) {
      postHogServerClient.captureException(
        new Error("Échec de l'analyse de la photo de couverture"),
      );
      return NextResponse.json(
        { error: "Une erreur est survenue." },
        { status: 500 },
      );
    }
    let event;
    try {
      event = await prisma.event.create({
        data: {
          title: title,
          date: nearestDate,
          notes: notes,
          pinned: pinned,
          type: type,
          password: password,
          coverName: parsedCover.name,
          coverUrl: parsedCover.url,
          coverWidth: parsedCover.width,
          coverHeight: parsedCover.height,
        },
      });
    } catch (dbError) {
      if (
        dbError instanceof Prisma.PrismaClientKnownRequestError &&
        dbError.code === "P2002"
      ) {
        postHogServerClient.captureException(dbError);
        return NextResponse.json(
          {
            error: "Un événement avec le même nom et la même date existe déjà",
          },
          { status: 409 },
        );
      }
      throw dbError;
    }
    //   console.log(event);

    return NextResponse.json({ event: event }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
