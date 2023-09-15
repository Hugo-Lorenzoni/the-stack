import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    //Find the absolute path of the json directory
    const jsonDirectory = path.join(process.cwd(), "src/data");
    //Read the json data file data.json
    const fileContents = await fs.readFile(
      jsonDirectory + "/comite.json",
      "utf8"
    );
    // console.log(fileContents);
    // const comite = JSON.parse(fileContents);
    // console.log(comite);

    //Return the content of the data file in json format
    return new Response(fileContents);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
