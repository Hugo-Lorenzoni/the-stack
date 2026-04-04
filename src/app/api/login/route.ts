import prisma from "@/lib/prisma";
import { withLogging } from "@/lib/withLogging";
import * as bcrypt from "bcrypt";

interface RequestBody {
  username: string;
  password: string;
}

export const POST = withLogging(async (req, { wideEvent }) => {
  wideEvent.action = "login";

  const body: RequestBody = await req.json();

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
});
