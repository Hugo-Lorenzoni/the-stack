import prisma from "@/lib/prisma";
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
    console.log(body);

    const result = formSchema.safeParse(body);

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const res = await prisma.video.update({
      where: {
        id: result.data.id,
      },
      data: {
        ...result.data,
      },
    });
    console.log(res);
    if (!res) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(res));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
