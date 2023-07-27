import prisma from "@/lib/prisma";
import { Cercle } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { NextResponse } from "next/server";

type UserRequest = {
  email: string;
  password: string;
  name: string;
  surname: string;
  check: boolean;
  cercle?: Cercle;
  autreCercle?: string;
  cercleVille?: string;
  promo?: number;
};
export async function POST(request: Request) {
  try {
    const body: UserRequest = await request.json();
    console.log(body);
    if (body.check) {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: await bcrypt.hash(body.password, 10),
          name: body.name,
          surname: body.surname,
          role: "WAITING",
          cercle: body?.cercle,
          cercleVille: body?.cercleVille,
          autreCercle: body?.autreCercle,
          promo: body?.promo,
        },
      });
      const { password, ...result } = user;
      return new Response(JSON.stringify(result));
    } else {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: await bcrypt.hash(body.password, 10),
          name: body.name,
          surname: body.surname,
          role: "USER",
        },
      });
      const { password, ...result } = user;
      return new Response(JSON.stringify(result));
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 }
    );
  }
}
