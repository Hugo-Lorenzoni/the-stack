import { cache } from "react";

import path from "path";
import { promises as fs } from "fs";
import { env } from "process";

export const getTextIntro = cache(async () => {
  // const res = await fetch("http://localhost:3000/api/text-intro", {
  //   next: { revalidate: 60 * 60 * 24 },
  // });
  // // The return value is *not* serialized
  // // You can return Date, Map, Set, etc.
  // if (!res.ok) {
  //   // This will activate the closest `error.js` Error Boundary
  //   throw new Error("Failed to fetch data");
  // }
  // return res.json();

  const jsonDirectory = path.join(env.DATA_FOLDER, "json");
  //Read the json data file data.json
  const fileContents = await fs.readFile(
    jsonDirectory + "/text-intro.json",
    "utf8",
  );
  return JSON.parse(fileContents);
});
