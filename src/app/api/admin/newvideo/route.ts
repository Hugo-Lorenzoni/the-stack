import { Video } from "@/app/admin/new-video/page";
import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: Video = await request.json();

    const url = new URL(body.url);
    const searchParams = url.searchParams;
    const id = searchParams.get("v");
    console.log(id);
    if (!id) {
      return NextResponse.json({ message: "Invalid URL" }, { status: 500 });
    }

    const date = getNearestMidnight(body.date);
    console.log("Date of the video", date.toISOString());

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
    console.log(video);

    return NextResponse.json({ video: video }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
