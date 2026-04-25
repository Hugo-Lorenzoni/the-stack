//import { signJwtAccessToken } from "@/lib/jwt";
import { postHogServerClient } from "@/lib/posthog";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcrypt";

interface RequestBody {
  username: string;
  password: string;
}
export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    const user = await prisma.user.findUnique({
      where: {
        email: body.username,
      },
    });

    if (user && (await bcrypt.compare(body.password, user.password))) {
      const { password, cercle, cercleVille, autreCercle, promo, ...userOnly } =
        user;
      const result = {
        ...userOnly,
      };
      return new Response(JSON.stringify(result));
    } else return new Response(JSON.stringify(null));
  } catch (error) {
    postHogServerClient.captureException(error);
    return new Response(JSON.stringify(null));
  }
}
