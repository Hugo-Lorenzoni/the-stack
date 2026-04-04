import { Video } from "@/app/admin/new-video/page";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";

export const POST = withLogging(async (req, { wideEvent }) => {
  const body: Video = await req.json();
  wideEvent.action = "new_video";

  const url = new URL(body.url);
  const id = url.searchParams.get("v");
  if (!id) {
    return NextResponse.json({ message: "Invalid URL" }, { status: 500 });
  }

  wideEvent.video_id = id;

  const date = getNearestMidnight(body.date);

  const video = await prisma.video.create({
    data: {
      id: id,
      url: body.url,
      name: body.name,
      date: date,
    },
  });

  if (!video) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  return NextResponse.json({ video: video }, { status: 200 });
});
