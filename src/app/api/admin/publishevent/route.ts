import { Event } from "@/app/admin/drafted-events/columns";
import { postHogServerClient } from "@/lib/posthog";
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
        publishedAt: new Date(),
      },
      select: {
        id: true,
        published: true,
      },
    });
    if (!result) {
      postHogServerClient.captureException(
        new Error(`Failed to publish event with id: ${body.id}`),
      );
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const { published } = result;
    return new Response(JSON.stringify(published));
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
