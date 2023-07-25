"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <p>{session.user.name}</p>
        <button onClick={() => signOut()} className="">
          Déconnexion
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn()} className="">
      Connexion
    </button>
  );
}
