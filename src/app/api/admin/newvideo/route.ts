import { Video } from "@/app/admin/new-video/page";
import { postHogServerClient } from "@/lib/posthog";
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
      postHogServerClient.captureException(
        new Error("No video ID found in the URL"),
      );
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
      postHogServerClient.captureException(
        new Error("Failed to create video in the database"),
      );
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }

    return NextResponse.json({ video: video }, { status: 200 });
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
