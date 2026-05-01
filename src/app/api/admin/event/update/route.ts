import { getDirectoryPath } from "@/lib/path";
import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { stat } from "fs/promises";
import { move } from "fs-extra";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { env } from "process";
import * as z from "zod";
import { Prisma } from "@prisma/client";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const valuesSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    date: z.string(),
    pinned: z.boolean(),
    type: z.enum(TypeList),
    password: z.string().optional(),
    notes: z.string().max(750).optional(),
  })
  .refine((data) => data.type !== "AUTRE" || data.password, {
    message: "Un mot de passe est requis pour les événement de type AUTRE",
    path: ["password"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // console.log(body);

    const result = valuesSchema.safeParse(body);

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { error: "Valeurs invalides", details: result.error.format() },
        { status: 400 },
      );
    }
    // console.log(result.data);
    const { id, title, date, pinned, type, password, notes } = result.data;

    const oldEvent = await prisma.event.findUnique({
      where: { id: id },
      select: {
        title: true,
        date: true,
        pinned: true,
        type: true,
        password: true,
        notes: true,
        photos: true,
        coverUrl: true,
      },
    });
    // console.log(oldEvent);

    if (!oldEvent) {
      postHogServerClient.captureException(
        new Error(`Événement avec l'ID ${id} non trouvé`),
      );
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 },
      );
    }

    const oldPath = getDirectoryPath(
      oldEvent.type,
      oldEvent.date,
      oldEvent.title,
    );
    // console.log(oldPath);

    const src = join(env.DATA_FOLDER, "photos", oldPath);

    console.log("Updated date", date);

    const nearestDate = getNearestMidnight(date);
    console.log(nearestDate);

    const existingEvent = await prisma.event.findFirst({
      where: {
        title,
        date: nearestDate,
        type,
        NOT: {
          id: id,
        },
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

    const newPath = getDirectoryPath(type, nearestDate, title);
    // console.log(newPath);

    const dest = join(env.DATA_FOLDER, "photos", newPath);
    // console.log(src, dest);
    const shouldRelocateFiles = oldPath !== newPath;

    if (shouldRelocateFiles) {
      try {
        await stat(dest);
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
    }

    const photos = shouldRelocateFiles
      ? oldEvent.photos.map((photo) => {
          const url = photo.url.replace(oldPath, newPath);
          const { createdAt, updatedAt, ...data } = photo;
          return { ...data, url };
        })
      : oldEvent.photos;

    const coverUrl = shouldRelocateFiles
      ? oldEvent.coverUrl.replace(oldPath, newPath)
      : oldEvent.coverUrl;

    let updateResult;
    try {
      updateResult = await prisma.$transaction([
        prisma.event.update({
          where: {
            id: id,
          },
          data: {
            title: title,
            date: nearestDate,
            pinned: pinned,
            type: type,
            password: type === "AUTRE" ? password : null,
            notes: notes,
            coverUrl: coverUrl,
          },
        }),
        ...(shouldRelocateFiles
          ? photos.map((photo) =>
              prisma.photo.update({
                where: {
                  id: photo.id,
                },
                data: {
                  url: photo.url,
                },
              }),
            )
          : []),
      ]);
    } catch (dbError) {
      postHogServerClient.captureException(dbError);
      if (
        dbError instanceof Prisma.PrismaClientKnownRequestError &&
        dbError.code === "P2002"
      ) {
        return NextResponse.json(
          {
            error:
              "Un événement avec le même nom et la même date existe déjà",
          },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Échec de la mise à jour de l'événement" },
        { status: 500 },
      );
    }

    if (shouldRelocateFiles) {
      try {
        await move(src, dest);
        console.log(`${id} - ${title} - Move successful !`);
      } catch (moveError) {
        postHogServerClient.captureException(
          new Error(`Échec du déplacement des fichiers pour l'événement ${id}`),
        );
        // Compensating rollback: restore DB to original state
        try {
          await prisma.$transaction([
            prisma.event.update({
              where: { id: id },
              data: {
                title: oldEvent.title,
                date: oldEvent.date,
                pinned: oldEvent.pinned,
                type: oldEvent.type,
                password: oldEvent.password,
                notes: oldEvent.notes,
                coverUrl: oldEvent.coverUrl,
              },
            }),
            ...oldEvent.photos.map((photo) =>
              prisma.photo.update({
                where: { id: photo.id },
                data: { url: photo.url },
              }),
            ),
          ]);
        } catch (rollbackError) {
          postHogServerClient.captureException(rollbackError);
          return NextResponse.json(
            {
              error:
                "Échec du déplacement des fichiers et de la restauration des données - l'état peut être incohérent",
            },
            { status: 500 },
          );
        }
        return NextResponse.json(
          { error: "Échec du déplacement des fichiers" },
          { status: 500 },
        );
      }
    }

    // console.log(data);
    return NextResponse.json({ event: updateResult[0] }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
