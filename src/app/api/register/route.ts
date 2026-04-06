import { Cercle } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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

    const payload = await auth.api.signUpEmail({
      body: {
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
      },
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const authError = error as { status?: number; message?: string };
    if (authError?.status) {
      return NextResponse.json(
        { message: authError.message ?? "Registration failed" },
        { status: authError.status },
      );
    }

    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
