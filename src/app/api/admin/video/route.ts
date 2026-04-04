import prisma from "@/lib/prisma";
import { getNearestMidnight } from "@/lib/time";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";
import { z } from "zod";

const formSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  url: z
    .string()
    .url()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  date: z.string(),
});

export const POST = withLogging(async (req, { wideEvent }) => {
  const body = await req.json();

  const result = formSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  wideEvent.action = "update_video";
  wideEvent.video_id = result.data.id;

  const updatedData = {
    ...result.data,
    date: getNearestMidnight(result.data.date),
  };

  const res = await prisma.video.update({
    where: {
      id: result.data.id,
    },
    data: {
      ...updatedData,
    },
  });

  if (!res) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  return new Response(JSON.stringify(res));
});
