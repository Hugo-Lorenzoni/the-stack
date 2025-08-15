import path from "path";
import { promises as fs } from "fs";
import { env } from "process";

export const getNewTextIntro = async () => {
  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  const fileContents = await fs.readFile(
    jsonDirectory + "/text-intro.json",
    "utf8",
  );
  const res = new Response(fileContents);
  return res.json();
};
