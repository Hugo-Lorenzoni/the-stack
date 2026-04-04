import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { env } from "process";
import { withLogging } from "@/lib/withLogging";

const comiteFormSchema = z.object({
  president: z.string(),
  responsableVideo: z.string(),
  responsablePhoto: z.string(),
  delegueVideo: z.string(),
  deleguePhoto: z.string(),
});

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "update_comite";

  const body: unknown = await req.json();

  const result = comiteFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  const updatedData = JSON.stringify(result.data);
  await fs.writeFile(jsonDirectory + "/comite.json", updatedData);

  return NextResponse.json(
    { message: "Comité mis à jour !" },
    { status: 200 },
  );
});
