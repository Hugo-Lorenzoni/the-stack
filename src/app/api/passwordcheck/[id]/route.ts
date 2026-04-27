import { getAutreEvent } from "@/utils/getAutreEvent";
import { getAutreEventPassword } from "@/utils/getAutreEventPassword";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encrypt } from "@/utils/encryption";
import { postHogServerClient } from "@/lib/posthog";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;

    const id = params.id;
    if (!id) {
      postHogServerClient.captureException(
        new Error("No id provided in request parameters"),
      );
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
        postHogServerClient.captureException(
          new Error(`No password found for event with id: ${id}`),
        );
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
        postHogServerClient.captureException(
          new Error(`No event found for id: ${id}`),
        );
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
  } catch (error) {
    postHogServerClient.captureException(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
