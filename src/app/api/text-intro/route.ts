import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { env } from "process";
import { postHogServerClient } from "@/lib/posthog";

export async function GET() {
  try {
    //Find the absolute path of the json directory
    const jsonDirectory = path.join(env.DATA_FOLDER, "json");
    //Read the json data file data.json
    const fileContents = await fs.readFile(
      jsonDirectory + "/text-intro.json",
      "utf8",
    );
    // console.log(fileContents);

    //Return the content of the data file in json format
    return new Response(fileContents);
  } catch (error) {
    postHogServerClient.captureException(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
