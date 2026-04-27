import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { NextResponse } from "next/server";
import { z } from "zod";

const formSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  url: z
    .string()
    .url()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  date: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = formSchema.safeParse(body);

    if (!result.success) {
      postHogServerClient.captureException(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const updatedData = {
      ...result.data,
      date: getNearestMidnight(result.data.date),
    };

    const res = await prisma.video.update({
      where: {
        id: result.data.id,
      },
      data: {
        ...updatedData,
      },
    });
    if (!res) {
      postHogServerClient.captureException(
        new Error(`Failed to update video with id: ${result.data.id}`),
      );
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(res));
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
