"use client";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

export default function AuthButton({ session }: { session: Session | null }) {
  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback className="text-orange-600 font-semibold">
                {Array.from(`${session.user.name}`)[0].toUpperCase() +
                  Array.from(`${session.user.surname}`)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="shadow-md" align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button onClick={() => signOut()} className="">
                Déconnexion
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  return (
    <>
      <Button
        className="font-semibold text-orange-600 bg-white hover:bg-white hover:bg-opacity-90"
        onClick={() => signIn()}
      >
        Se connecter
      </Button>
      <Button
        className="font-semibold text-white border-2 bg-orange-600 hover:bg-orange-500 ml-4"
        asChild
      >
        <Link href="/register">Créer un compte</Link>
      </Button>
    </>
  );
}
