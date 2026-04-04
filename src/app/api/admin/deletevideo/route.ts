import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().min(1);

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "delete_video";

  const body = await req.json();
  const result = idSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  wideEvent.video_id = result.data;

  const video = await prisma.video.delete({
    where: {
      id: result.data,
    },
  });

  if (!video) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  return new Response(JSON.stringify(video.name));
});
