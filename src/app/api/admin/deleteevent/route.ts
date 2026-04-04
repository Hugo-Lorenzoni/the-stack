import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { rm } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { env } from "process";
import { z } from "zod";

const idSchema = z.string().min(1);

export const POST = withLogging(async (req, { wideEvent }) => {
  const body = await req.json();
  wideEvent.action = "delete_event";

  const result = idSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  wideEvent.event_id = result.data;

  const event = await prisma.event.delete({
    where: {
      id: result.data,
    },
    select: {
      title: true,
      date: true,
      type: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const dateString = new Date(event.date.toISOString().substring(0, 10))
    .toISOString()
    .substring(0, 10);

  const folder = `/${event.type}/${dateString}-${event.title
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")}`;

  const path = join(env.DATA_FOLDER, "photos", folder);

  await rm(path, { recursive: true, force: true });

  return new Response(JSON.stringify(event.title));
});
