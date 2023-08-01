import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getNextAuthSession } from "@/utils/auth";

export async function GET(request: Request) {
  console.log(request);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  console.log(search);

  if (!search) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
  const session = await getNextAuthSession();
  console.log(session);

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
        coverName: true,
        coverUrl: true,
        coverWidth: true,
        coverHeight: true,
      },
      orderBy: [{ date: "desc" }],
    });
    if (!results) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }
    console.log(results);
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
        coverName: true,
        coverUrl: true,
        coverWidth: true,
        coverHeight: true,
      },
      orderBy: [{ date: "desc" }],
    });
    if (!results) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }
    console.log(results);
    return new Response(JSON.stringify(results));
  }
}
