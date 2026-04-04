import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";

type Body = {
  email: string;
  role: "ADMIN" | "BAPTISE" | "USER" | "WAITING";
};

export const POST = withLogging(async (req, { wideEvent }) => {
  const body: Body = await req.json();
  wideEvent.action = "update_user";
  wideEvent.resource = "user";
  wideEvent.new_role = body.role;

  const result = await prisma.user.update({
    where: {
      email: body.email,
    },
    data: {
      role: body.role,
    },
    select: {
      email: true,
      role: true,
    },
  });

  if (!result) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
  return new Response(JSON.stringify(result));
});

export const DELETE = withLogging(async (req, { wideEvent }) => {
  const email: string = await req.json();
  wideEvent.action = "delete_user";
  wideEvent.resource = "user";

  const result = await prisma.user.delete({
    where: {
      email: email,
    },
  });

  if (!result) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
  return new Response(JSON.stringify(result));
});
