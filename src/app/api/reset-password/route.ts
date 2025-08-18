import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import * as bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const formSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(
      new RegExp(".*[A-Z].*"),
      "Le mot de passe doit contenir au moins une majuscule",
    )
    .regex(
      new RegExp(".*[a-z].*"),
      "Le mot de passe doit contenir au moins une minuscule",
    )
    .regex(
      new RegExp(".*\\d.*"),
      "Le mot de passe doit contenir au moins un chiffre",
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = formSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.errors },
        { status: 400 },
      );
    }

    const { token, password } = result.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const resetPasswordEntry = await prisma.resetPassword.findUnique({
      where: {
        token: crypto.createHash("sha256").update(token).digest("hex"),
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!resetPasswordEntry) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: resetPasswordEntry?.userId },
    });

    await prisma.user.update({
      where: { id: user?.id },
      data: { password: hashedPassword },
    });

    await prisma.resetPassword.update({
      where: { id: resetPasswordEntry.id },
      data: { used: true },
    });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
