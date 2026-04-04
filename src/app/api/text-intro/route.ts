import path from "path";
import { promises as fs } from "fs";
import { env } from "process";
import { withLogging } from "@/lib/withLogging";

export const GET = withLogging(async (_req, { wideEvent }) => {
  wideEvent.action = "get_text_intro";

  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  const fileContents = await fs.readFile(
    jsonDirectory + "/text-intro.json",
    "utf8",
  );

  return new Response(fileContents);
});
