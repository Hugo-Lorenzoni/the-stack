import { Event } from "@/app/admin/drafted-events/columns";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: Event = await request.json();
    const result = await prisma.event.update({
      where: {
        id: body.id,
      },
      data: {
        published: true,
      },
      select: {
        id: true,
        published: true,
      },
    });
    console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }
    const { published } = result;
    return new Response(JSON.stringify(published));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
