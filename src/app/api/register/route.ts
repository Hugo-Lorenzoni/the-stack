import prisma from "@/app/lib/prisma";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";

// interface RequestBody {
//   email: string;
//   password: string;
//   name: string;
//   surname: string;
//   role: Role | undefined;
//   cercle?: Cercle | undefined | null;
//   cercleVille?: string;
//   autreCercle?: string;
//   promo?: string;
// }

export async function POST(request: Request) {
  const body: User = await request.json();
  console.log(body);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      name: body.name,
      surname: body.surname,
      role: body.role,
      cercle: body?.cercle,
      cercleVille: body?.cercleVille,
      autreCercle: body?.autreCercle,
      promo: body?.promo,
    },
  });

  const { password, ...result } = user;
  return new Response(JSON.stringify(result));
}
