import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().min(1);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = idSchema.safeParse(body);

    if (!result.success) {
      // handle error then return
      console.log(result.error);
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }

    const video = await prisma.video.delete({
      where: {
        id: result.data,
      },
    });
    console.log(video);
    if (!video) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(video.name));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
