import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { env } from "process";
import { withLogging } from "@/lib/withLogging";

const textFormSchema = z.object({
  title: z.string(),
  text: z.array(z.string()),
  signature: z.string(),
  date: z.string(),
});

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "update_text_intro";

  const body: unknown = await req.json();

  const result = textFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  const updatedData = JSON.stringify(result.data);
  await fs.writeFile(jsonDirectory + "/text-intro.json", updatedData);

  return NextResponse.json(
    { message: "Texte d'introduction mis à jour !" },
    { status: 200 },
  );
});
