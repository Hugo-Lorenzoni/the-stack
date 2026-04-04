import { Event } from "@/app/admin/drafted-events/columns";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";

export const POST = withLogging(async (req, { wideEvent }) => {
  const body: Event = await req.json();
  wideEvent.action = "publish_event";
  wideEvent.event_id = body.id;

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
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const { published } = result;
  return new Response(JSON.stringify(published));
});
