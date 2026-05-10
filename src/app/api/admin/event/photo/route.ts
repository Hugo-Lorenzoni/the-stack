import sizeOf from "image-size";
import { saveFile } from "@/lib/files";
import { getDirectoryPath, getFileName } from "@/lib/path";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { postHogServerClient } from "@/lib/posthog";
import { stat, unlink } from "fs/promises";
import { join } from "path";
import { env } from "process";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

// ─── Schemas ──────────────────────────────────────────────────────────────────

const photoSchema = z.object({
  name: z.string(),
  url: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const valuesSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(TypeList),
  title: z.string().min(1),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Silently removes a file from disk; logs but does not throw if it fails. */
async function tryUnlink(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (cleanupError) {
    postHogServerClient.captureException(
      new Error(`Cleanup failed for orphaned file: ${filePath}`, {
        cause: cleanupError,
      }),
    );
  }
}

/** Returns the validated DATA_FOLDER env var, or throws a clear error. */
function getDataFolder(): string {
  const folder = env.DATA_FOLDER;
  if (!folder) {
    throw new Error("DATA_FOLDER environment variable is not set.");
  }
  return folder;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Track the saved path so we can roll back on later failures.
  let savedFilePath: string | null = null;

  try {
    // ── 1. Parse form data ───────────────────────────────────────────────────

    const data = await request.formData();

    const rawValues = data.get("values");
    if (typeof rawValues !== "string" || !rawValues) {
      return NextResponse.json(
        { error: "Aucune valeur fournie dans la requête." },
        { status: 400 },
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawValues);
    } catch {
      return NextResponse.json(
        { error: "Le champ 'values' n'est pas un JSON valide." },
        { status: 400 },
      );
    }

    const valuesResult = valuesSchema.safeParse(parsedJson);
    if (!valuesResult.success) {
      postHogServerClient.captureException(valuesResult.error);
      return NextResponse.json(
        {
          error: "Les valeurs fournies sont invalides.",
          details: valuesResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const currentEvent = valuesResult.data;

    // ── 2. Validate the uploaded file ────────────────────────────────────────

    const photoFile = data.get("file");

    if (!(photoFile instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni dans la requête." },
        { status: 400 },
      );
    }

    if (photoFile.size === 0) {
      return NextResponse.json(
        { error: "Le fichier fourni est vide." },
        { status: 400 },
      );
    }

    if (photoFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Le fichier dépasse la taille maximale autorisée (${MAX_FILE_SIZE_BYTES / 1024 / 1024} Mo).`,
        },
        { status: 413 },
      );
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        photoFile.type as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return NextResponse.json(
        {
          error: `Type de fichier non supporté. Types acceptés : ${ALLOWED_MIME_TYPES.join(", ")}.`,
        },
        { status: 415 },
      );
    }

    // ── 3. Derive paths and read the buffer once ─────────────────────────────

    const dataFolder = getDataFolder();
    const eventDate = new Date(currentEvent.date);

    const relativeUploadDir = getDirectoryPath(
      currentEvent.type,
      eventDate,
      currentEvent.title,
    );
    const filename = getFileName(photoFile, false);
    const relativePhotoUrl = `${relativeUploadDir}/${filename}`;
    const absolutePhotoPath = join(dataFolder, "photos", relativePhotoUrl);

    // Read the buffer once; reuse for both sizeOf and saveFile.
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());

    // ── 4. Detect image dimensions before touching disk or DB ────────────────

    let dimensions: { width?: number; height?: number };
    try {
      dimensions = sizeOf(photoBuffer);
    } catch (sizeError) {
      postHogServerClient.captureException(sizeError);
      return NextResponse.json(
        {
          error:
            "Impossible de lire les dimensions de l'image. Le fichier est peut-être corrompu.",
        },
        { status: 422 },
      );
    }

    if (!dimensions.width || !dimensions.height) {
      return NextResponse.json(
        { error: "Impossible de déterminer les dimensions de l'image." },
        { status: 422 },
      );
    }

    // ── 5. Consistency check with self-healing ───────────────────────────────
    //
    // Four possible states for (DB record, file on disk):
    //
    //  ✅ (absent,  absent)  → clean slate, proceed normally
    //  ❌ (present, present) → genuine duplicate, return 409
    //  ⚠️ (present, absent)  → stale DB record (file lost), delete it and heal
    //  ⚠️ (absent,  present) → orphaned file (DB write failed earlier), delete it and heal

    const existingPhoto = await prisma.photo.findFirst({
      where: { url: relativePhotoUrl },
      select: { id: true },
    });

    let fileExistsOnDisk = false;
    try {
      await stat(absolutePhotoPath);
      fileExistsOnDisk = true;
    } catch (statError: any) {
      if (statError?.code !== "ENOENT") {
        postHogServerClient.captureException(statError);
        return NextResponse.json(
          {
            error:
              "Une erreur est survenue lors de la vérification du fichier.",
          },
          { status: 500 },
        );
      }
    }

    if (existingPhoto && fileExistsOnDisk) {
      // Genuine duplicate — both sides agree the photo exists.
      return NextResponse.json(
        {
          error:
            "Cette photo existe déjà dans la base de données pour cet événement.",
        },
        { status: 409 },
      );
    }

    if (existingPhoto && !fileExistsOnDisk) {
      // Stale DB record: the file was deleted from disk but the record remains.
      // Heal by removing the dangling record so the upload can proceed.
      postHogServerClient.captureException(
        new Error(
          `Stale DB record (no file on disk) — healing: ${relativePhotoUrl}`,
        ),
      );
      await prisma.photo.delete({ where: { id: existingPhoto.id } });
    }

    if (!existingPhoto && fileExistsOnDisk) {
      // Orphaned file: a previous upload saved the file but never wrote to the DB.
      // Heal by removing the orphaned file so the upload can proceed cleanly.
      postHogServerClient.captureException(
        new Error(
          `Orphaned file (no DB record) — healing: ${absolutePhotoPath}`,
        ),
      );
      await tryUnlink(absolutePhotoPath);
    }

    // Both checks passed (or inconsistency was healed) — safe to proceed.

    // ── 6. Persist to disk ───────────────────────────────────────────────────

    const photoURL = await saveFile(
      photoFile,
      currentEvent.title,
      eventDate,
      currentEvent.type,
      false,
    );
    savedFilePath = absolutePhotoPath;

    // ── 7. Build and validate the photo record ───────────────────────────────

    const parsedPhoto = photoSchema.parse({
      name: photoFile.name,
      url: photoURL,
      width: dimensions.width,
      height: dimensions.height,
    });

    // ── 8. Write to the database (with rollback on failure) ──────────────────

    let createdPhoto: {
      id: string;
      name: string;
      url: string;
      width: number;
      height: number;
      eventId: string;
    };

    try {
      createdPhoto = await prisma.photo.create({
        data: {
          ...parsedPhoto,
          event: { connect: { id: currentEvent.id } },
        },
        select: {
          id: true,
          name: true,
          url: true,
          width: true,
          height: true,
          eventId: true,
        },
      });
    } catch (dbError) {
      // Roll back the file we just saved to avoid orphaned files.
      await tryUnlink(absolutePhotoPath);
      savedFilePath = null;

      if (
        dbError instanceof Prisma.PrismaClientKnownRequestError &&
        dbError.code === "P2002"
      ) {
        return NextResponse.json(
          {
            error:
              "Cette photo existe déjà dans la base de données pour cet événement.",
          },
          { status: 409 },
        );
      }

      throw dbError; // Re-throw so the outer handler captures it.
    }

    return NextResponse.json({ photo: createdPhoto }, { status: 200 });
  } catch (error) {
    // If a file was saved before we hit this point, clean it up.
    if (savedFilePath) {
      await tryUnlink(savedFilePath);
    }

    postHogServerClient.captureException(error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload de la photo." },
      { status: 500 },
    );
  }
}
