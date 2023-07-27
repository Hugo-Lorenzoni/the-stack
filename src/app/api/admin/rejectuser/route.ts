import { User } from "@/app/admin/accounts-approval/columns";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: User = await request.json();
    const result = await prisma.user.update({
      where: {
        email: body.email,
      },
      data: {
        role: "USER",
      },
      select: {
        id: true,
        role: true,
      },
    });
    console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 }
      );
    }
    const { role } = result;
    return new Response(JSON.stringify(role));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
