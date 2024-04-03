import minioClient from "@/lib/minio";
import prisma from "@/lib/prisma";
import { Photo } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const body: Photo = await request.json();

    await minioClient.removeObject("cpv", body.url, function (e: Error | null) {
      if (e) {
        return console.log(e);
      }
      console.log(`${body.name} deleted successfully`);
    });

    const result = await prisma.photo.delete({
      where: {
        id: body.id,
      },
    });
    // console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const { name } = result;
    return new Response(JSON.stringify(name));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
