import { Cercle } from "@prisma/client";
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
    const role = body.check ? "WAITING" : "USER";

    const response = await fetch(
      new URL("/api/auth/sign-up/email", request.url),
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          name: body.name,
          surname: body.surname,
          role,
          cercle: body.check ? body.cercle : undefined,
          cercleVille: body.check ? body.cercleVille : undefined,
          autreCercle: body.check
            ? body.autreCercle?.toLocaleUpperCase()
            : undefined,
          promo: body.check ? body.promo : undefined,
        }),
      },
    );

    if (!response.ok) {
      const errorPayload = await response.json();
      return NextResponse.json(errorPayload, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
