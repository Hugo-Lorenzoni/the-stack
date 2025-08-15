import path from "path";
import { promises as fs } from "fs";
import { env } from "process";

export const getNewComite = async () => {
  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  const fileContents = await fs.readFile(
    jsonDirectory + "/comite.json",
    "utf8",
  );
  const res = new Response(fileContents);
  return res.json();
};
