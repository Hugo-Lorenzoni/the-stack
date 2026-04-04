import prisma from "@/lib/prisma";
import { withLogging, WideEvent } from "@/lib/withLogging";
import { Cercle } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { NextRequest } from "next/server";

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

export const POST = withLogging(async (request: NextRequest, { wideEvent }: { params: Promise<Record<string, string>>; wideEvent: WideEvent }) => {
  const body: UserRequest = await request.json();

  const role = body.check ? "WAITING" : "USER";
  wideEvent.registration = { role, cercle: body.cercle ?? null };

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
        autreCercle: body?.autreCercle?.toLocaleUpperCase(),
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
});
