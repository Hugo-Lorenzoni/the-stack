import { getAutreEvent } from "@/utils/getAutreEvent";
import { getAutreEventPassword } from "@/utils/getAutreEventPassword";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/utils/encryption";
import { withLogging } from "@/lib/withLogging";

export const POST = withLogging(async (req, { params, wideEvent }) => {
  const { id } = await params;
  wideEvent.action = "password_check";

  if (!id) {
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }

  wideEvent.event_id = id;

  const body: { password: string } = await req.json();
  const password = body.password;

  if (password) {
    const res = await getAutreEventPassword(id);
    if (!res) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    if (password != res.password) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const results = await getAutreEvent(id);
    if (!results) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const secret = encrypt(id);
    (await cookies()).set(id, secret.toString(), {
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, //30j
    });
    return new Response(JSON.stringify(results));
  }

  return NextResponse.json(
    { message: "Something went wrong !" },
    { status: 500 },
  );
});
