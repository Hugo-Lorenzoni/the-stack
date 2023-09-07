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
import { Copy } from "lucide-react";

export default function AuthButton({ session }: { session: Session | null }) {
  if (session && session.user) {
    const validationCode = session.user.id.substring(0, 8);
    return (
      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center hover:opacity-80 ease-in-out duration-150">
            <Avatar>
              <AvatarFallback className="text-orange-600 font-semibold">
                {Array.from(`${session.user.name}`)[0].toUpperCase() +
                  Array.from(`${session.user.surname}`)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="ml-4 xl:hidden">
              {session.user.name} {session.user.surname}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="shadow-md" align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuItem>
              <Button onClick={() => signOut()} className="w-full">
                Déconnexion
              </Button>
            </DropdownMenuItem>
            {session.user.role == "WAITING" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Code de validation</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard.writeText(validationCode)
                    }
                  >
                    <Copy className="mr-2" />
                    {validationCode}
                  </Button>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  return (
    <div className="flex gap-4 flex-wrap">
      <Button
        className="font-semibold text-orange-600 bg-white hover:bg-white hover:bg-opacity-90"
        onClick={() => signIn()}
      >
        Se connecter
      </Button>
      <Button
        className="font-semibold text-white border-2 bg-orange-600 hover:bg-orange-500"
        asChild
      >
        <Link href="/register">Créer un compte</Link>
      </Button>
    </div>
  );
}
