import prisma from "@/lib/prisma";
import { Photo } from "@prisma/client";
import { NextResponse } from "next/server";
import { stat, unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(request: Request) {
  try {
    const body: Photo = await request.json();

    const path = join(process.cwd(), "public", body.url);
    console.log(await stat(path));

    await unlink(path);

    const result = await prisma.photo.delete({
      where: {
        id: body.id,
      },
    });
    console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }
    const { name } = result;
    return new Response(JSON.stringify(name));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
