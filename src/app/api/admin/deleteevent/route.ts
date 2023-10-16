import prisma from "@/lib/prisma";
import { rm } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
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
        { status: 500 },
      );
    }

    const event = await prisma.event.delete({
      where: {
        id: result.data,
      },
      select: {
        title: true,
        date: true,
        type: true,
      },
    });
    console.log(event);
    if (!event) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    const folder = `/${event.type}/${event.date
      .toISOString()
      .substring(0, 10)}-${event.title
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "-")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ê/g, "e")
      .replace(/à/g, "a")
      .replace(/â/g, "a")}`;
    // console.log(folder);

    const path = join(process.cwd(), "public", folder);
    // console.log(path);

    // console.log(await stat(path));

    await rm(path, { recursive: true, force: true });

    return new Response(JSON.stringify(event.title));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
