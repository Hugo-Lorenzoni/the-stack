import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getNextAuthSession } from "@/utils/auth";
import { postHogServerClient } from "@/lib/posthog";

export async function GET(request: Request) {
  try {
    // console.log(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q");
    // console.log(search);

    if (!search) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const session = await getNextAuthSession();
    // console.log(session);

    if (session?.user?.role == "ADMIN" || session?.user?.role == "BAPTISE") {
      const results = await prisma.event.findMany({
        where: {
          title: {
            contains: search,
          },
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
      if (!results) {
        postHogServerClient.captureException(new Error("No results found"));
        return NextResponse.json(
          { message: "Something went wrong !" },
          { status: 500 },
        );
      }
      // Add 12 hours to each event's date
      results.forEach((event) => {
        event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
      });
      // console.log(results);
      return new Response(JSON.stringify(results));
    } else {
      const results = await prisma.event.findMany({
        where: {
          OR: [
            {
              title: {
                contains: search,
              },
              type: "OUVERT",
              published: true,
            },
            {
              title: {
                contains: search,
              },
              type: "AUTRE",
              published: true,
            },
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
      if (!results) {
        postHogServerClient.captureException(new Error("No results found"));
        return NextResponse.json(
          { message: "Something went wrong !" },
          { status: 500 },
        );
      }
      // Add 12 hours to each event's date
      results.forEach((event) => {
        event.date = new Date(event.date.getTime() + 12 * 60 * 60 * 1000);
      });
      // console.log(results);
      return new Response(JSON.stringify(results));
    }
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
