import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { env } from "process";

const comiteFormSchema = z.object({
  president: z.string(),
  responsableVideo: z.string(),
  responsablePhoto: z.string(),
  delegueVideo: z.string(),
  deleguePhoto: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    // console.log(body);

    const result = comiteFormSchema.safeParse(body);
    if (!result.success) {
      // handle error then return
      console.log(result.error);

      result.error;
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    } else {
      try {
        const jsonDirectory = path.join(env.DATA_FOLDER, "json");

        // Convert the object back to a JSON string
        const updatedData = JSON.stringify(result.data);

        // Write the updated data to the JSON file
        await fs.writeFile(jsonDirectory + "/comite.json", updatedData);

        // Send an error response
        return NextResponse.json(
          { message: "Comité mis à jour !" },
          { status: 200 },
        );
      } catch (error) {
        console.log(error);
        // Send an error response
        return NextResponse.json(
          { message: "Something went wrong !" },
          { status: 500 },
        );
      }
    }
  } catch (error) {
    console.log(error);
    // Send an error response
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
