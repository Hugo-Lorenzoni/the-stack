import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Body = {
  email: string;
  role: "ADMIN" | "BAPTISE" | "USER" | "WAITING";
};

export async function POST(request: Request) {
  try {
    const body: Body = await request.json();
    console.log(body);

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
    console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(result));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const email: string = await request.json();
    // return new Response(JSON.stringify(body.email));

    const result = await prisma.user.delete({
      where: {
        email: email,
      },
    });
    // console.log(result);
    if (!result) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    return new Response(JSON.stringify(result));
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
