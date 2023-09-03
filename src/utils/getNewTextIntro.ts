import path from "path";
import { promises as fs } from "fs";

export const getNewTextIntro = async () => {
  const jsonDirectory = path.join(process.cwd(), "src/data");
  //Read the json data file data.json
  const fileContents = await fs.readFile(
    jsonDirectory + "/text-intro.json",
    "utf8"
  );
  // console.log(fileContents);

  //Return the content of the data file in json format
  const res = new Response(fileContents);
  return res.json();
};
