import { User } from "@/app/admin/accounts-approval/columns";
import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import { NextResponse } from "next/server";

export const POST = withLogging(async (req, { wideEvent }) => {
  const body: User = await req.json();
  wideEvent.action = "accept_user";

  const result = await prisma.user.update({
    where: {
      email: body.email,
    },
    data: {
      role: "BAPTISE",
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!result) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  const { role } = result;
  return new Response(JSON.stringify(role));
});
