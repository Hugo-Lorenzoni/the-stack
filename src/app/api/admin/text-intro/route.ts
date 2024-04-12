import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import minioClient from "@/lib/minio";

const textFormSchema = z.object({
  title: z.string(),
  text: z.array(z.string()),
  signature: z.string(),
  date: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = textFormSchema.safeParse(body);
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
        // Convert the object back to a JSON string
        const updatedData = JSON.stringify(result.data);

        // Write the updated data to the JSON file
        const submitFileDataResult = await minioClient
          .putObject("cpv", "JSON/text-intro.json", updatedData)
          .catch((e: any) => {
            console.log("Error while creating object from file data: ", e);
            throw e;
          });
        console.log("File data submitted successfully: ", submitFileDataResult);

        // Send an error response
        return NextResponse.json(
          { message: "Texte d'introduction mis à jour !" },
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
