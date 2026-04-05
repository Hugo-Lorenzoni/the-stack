import { getAutreEvent } from "@/utils/getAutreEvent";
import { getAutreEventPassword } from "@/utils/getAutreEventPassword";
import { getPostHogClient } from "@/lib/posthog-server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/utils/encryption";
import { getNextAuthSession } from "@/utils/auth";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: "Something went wrong !" },
        { status: 500 },
      );
    }
    const body: { password: string } = await request.json();
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
      const session = await getNextAuthSession();
      const distinctId = session?.user?.id ?? `anon-${id}`;
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId,
        event: "password_protected_event_unlocked",
        properties: { event_id: id },
      });
      await posthog.shutdown();
      return new Response(JSON.stringify(results));
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
