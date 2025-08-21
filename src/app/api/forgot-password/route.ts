import { nodemailerClient } from "@/lib/email";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";
import z from "zod";

const formSchema = z.object({
  email: z.string().email(),
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

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Cet email n'existe pas" },
        { status: 404 },
      );
    }

    // Random 32-byte token, encoded as hex
    const token = crypto.randomBytes(32).toString("hex");

    // Hash for storing in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Expiration time (1 hour)
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.resetPassword.create({
      data: {
        token: hashedToken,
        expiresAt: expires,
        used: false,
        userId: user.id,
      },
    });

    const resetLink = `${env.NEXTAUTH_URL}/reset-password/${token}`;

    const emailContent = `
        <h3>Bonjour ${user.name},</h3>
        <p>Vous avez demandé un lien de réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe : <a href="${resetLink}">Réinitialiser le mot de passe</a></p>
        `;

    await nodemailerClient.sendMail({
      from: env.GMAIL_EMAIL_ADDRESS,
      to: user.email,
      subject: "CPV FPMs - Réinitialisation du mot de passe",
      html: emailContent,
    });

    return NextResponse.json(
      { message: "Password reset link sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
