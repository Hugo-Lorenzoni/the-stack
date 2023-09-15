import { cache } from "react";

import path from "path";
import { promises as fs } from "fs";

export const getComite = cache(async () => {
  // const res = await fetch("http://localhost:3000/api/comite", {
  //   next: { revalidate: 60 * 60 * 24 },
  // });
  // // The return value is *not* serialized
  // // You can return Date, Map, Set, etc.
  // if (!res.ok) {
  //   // This will activate the closest `error.js` Error Boundary
  //   throw new Error("Failed to fetch data");
  // }
  // return res.json();

  const jsonDirectory = path.join(process.cwd(), "src/data");
  //Read the json data file data.json
  const fileContents = await fs.readFile(
    jsonDirectory + "/comite.json",
    "utf8"
  );
  // console.log(fileContents);
  return JSON.parse(fileContents);
});
