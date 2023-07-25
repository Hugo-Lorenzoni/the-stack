//import { signJwtAccessToken } from "@/lib/jwt";
import prisma from "@/app/lib/prisma";
import * as bcrypt from "bcrypt";

interface RequestBody {
  username: string;
  password: string;
}
export async function POST(request: Request) {
  const body: RequestBody = await request.json();

  const user = await prisma.user.findUnique({
    where: {
      email: body.username,
    },
  });

  if (user && (await bcrypt.compare(body.password, user.password))) {
    const {
      password,
      surname,
      cercle,
      cercleVille,
      autreCercle,
      promo,
      ...userOnly
    } = user;
    //const accessToken = signJwtAccessToken(userWithoutPass);
    const result = {
      ...userOnly,
      //accessToken,
    };
    return new Response(JSON.stringify(result));
  } else return new Response(JSON.stringify(null));
}
