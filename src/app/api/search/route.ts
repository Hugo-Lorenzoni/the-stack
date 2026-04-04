import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withLogging, WideEvent } from "@/lib/withLogging";
import { hashValue } from "@/lib/hashValue";

async function handler(
  request: NextRequest,
  { wideEvent }: { params: Promise<Record<string, string>>; wideEvent: WideEvent },
) {
  wideEvent.action = "search";

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q");

  if (!search) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  // Hash the search term before logging to avoid storing raw user input
  wideEvent.query_hash = hashValue(search);

  const isPrivileged =
    wideEvent.user != null &&
    (
      (wideEvent.user as { role?: string }).role === "ADMIN" ||
      (wideEvent.user as { role?: string }).role === "BAPTISE"
    );

  let results;

  if (isPrivileged) {
    results = await prisma.event.findMany({
      where: {
        title: { contains: search },
        published: true,
      },
      select: {
        id: true,
        title: true,
        date: true,
        pinned: true,
        type: true,
        coverName: true,
        coverUrl: true,
        coverWidth: true,
        coverHeight: true,
      },
      orderBy: [{ date: "desc" }],
    });
  } else {
    results = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: search }, type: "OUVERT", published: true },
          { title: { contains: search }, type: "AUTRE", published: true },
        ],
      },
      select: {
        id: true,
        title: true,
        date: true,
        pinned: true,
        type: true,
        coverName: true,
        coverUrl: true,
        coverWidth: true,
        coverHeight: true,
      },
      orderBy: [{ date: "desc" }],
    });
  }

  // Add 12 hours to each event's date
  results.forEach((event) => {
    event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
  });

  wideEvent.result_count = results.length;

  return new Response(JSON.stringify(results));
}

export const GET = withLogging(handler);
